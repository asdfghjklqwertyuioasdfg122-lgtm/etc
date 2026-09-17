# Implementation Plan - Robust Password Hashing (bcrypt)

Implement a robust cryptographic password hashing mechanism using `bcryptjs` for the user authentication system to ensure credentials are never stored in plain text or vulnerable to brute-force dictionary attacks.

## Security Threat Model

### Component Overview
The ETC ERP authentication and user management component handles system owner setup, user registration by the owner, credential verification during login, password reset, and session management. Credential management must resist offline brute-force, rainbow tables, and timing attacks.

### Entry Points and Untrusted Inputs
| Entry Point | Type | Trusted? | Validation |
|---|---|---|---|
| `OwnerSetupWizard` form | UI Form input (password, confirmPassword) | Untrusted | Length >= 6, matching confirmation |
| `LoginPage` form | UI Form input (username, password) | Untrusted | Non-empty check, trimmed username |
| `UserManagementModule` create user form | UI Form input (password, confirmPassword) | Untrusted | Length >= 6, matching confirmation, owner privilege guard |
| `UserManagementModule` reset password modal | UI Form input (newPassword, confirmPassword) | Untrusted | Length >= 6, matching confirmation, owner privilege guard |

### Trust Boundaries and Auth Assumptions
- **Authentication**: User credentials verified against stored bcrypt hashes.
- **Authorization**: Only the permanent System Owner (`محمد عبد الغني`) can create users, change roles, or reset credentials.
- **Implicit trust assumptions**: Client-side storage (`localStorage`) holds application state in this single-tenant web environment. Password hashes stored in local storage must be cryptographically salted with an adaptive slow-hash function (bcrypt) so that even if storage is extracted, precomputed dictionary or rainbow table attacks are computationally infeasible.

### Sensitive Data Paths
| Data Type | Source | Destination | Protection |
|---|---|---|---|
| Plaintext password | Form inputs (`LoginPage`, `OwnerSetupWizard`, `UserManagementModule`) | `src/utils/crypto.ts` (`hashPassword` / `verifyPassword`) | In-memory only; cleared from component state; never logged or serialized |
| Password hash | `hashPassword` (`bcrypt.hashSync`) | `STORAGE_KEYS.USERS` in `StorageService` | Adaptive 10-round bcrypt work factor with per-password 128-bit random salt |
| Passwords during display | User table / Activity log | UI components | Never rendered; masked or omitted |

### Privileged Actions
| Action | Location | Guard |
|---|---|---|
| Owner Setup | `StorageService.initOwner` | Only possible when no owner exists |
| Create User | `StorageService.createUser` | Guarded by Owner role check in UI & Service |
| Reset Password | `StorageService.resetPassword` | Guarded by Owner role check |
| User Status Modification | `StorageService.toggleUserStatus` | Guarded against disabling owner |

### Priority Review Areas
1. **Password Hashing Algorithm**: Transition from custom single-round SHA-256 with static salt (and deprecated `btoa` fallback) to `bcryptjs` with per-user cryptographic salt and 10 rounds.
2. **Backward Compatibility & Safe Migration**: Support verifying legacy hashes if any exist and automatically migrating them to bcrypt on successful login, while removing insecure `btoa` plain base64 fallback.
3. **Password Leak Prevention**: Ensure plain passwords are never saved to activity logs, login history, or rendered in user inspection tables.

---

## Proposed Changes

### 1. Cryptographic Utility (`src/utils/crypto.ts`)
- Replace static SHA-256 password hashing with `bcryptjs.hashSync(password, 10)` (with 10 salt rounds).
- Implement `bcryptjs.compareSync(password, storedHash)` in `verifyPassword`.
- Retain fallback comparison for prior SHA-256 hashes with migration flag, while explicitly eliminating any `btoa` plain base64 verification.
- Provide helper function `isBcryptHash(hash: string): boolean` to detect `$2a$` or `$2b$` prefixes.

### 2. Authentication Storage Service (`src/services/storage.ts`)
- Verify all password hashing points (`initOwner`, `createUser`, `resetPassword`) use the updated `hashPassword`.
- In `login()`, check if user's password was verified against a legacy hash; if so, immediately upgrade and re-hash `user.passwordHash` using the new bcrypt algorithm and persist.

### 3. Verification & Documentation
- Update `walkthrough.md` with `# SecureCoder Security Audit` and `## PoC Verification`.

---

## Verification Plan

### Security Verification
- **Security Scan**: Inspect all newly created and modified files for common CWE vulnerabilities (CWE-256 Plaintext Storage, CWE-916 Weak Cryptographic Hash, CWE-328 Reversible Encoding). Resolve any detected issues immediately.
- **Security Audit**: Audit the implementation against the component's threat model (`## Security Threat Model`). Document all findings, dispositions, and remediations in `walkthrough.md` using the `generate-security-audit-report` skill.
- **PoC Verification**: Validate using the `run-poc` skill that weak hash and plain text decoding vectors are neutralized by bcrypt work factor and per-password salts.
- **Code Compilation & Linting**: Run `lint_applet` and `compile_applet` to confirm zero TypeScript errors and clean production build.
