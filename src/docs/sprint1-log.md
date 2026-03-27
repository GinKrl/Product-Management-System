# ✅ Sprint 1

## 📅 Duration
**Sprint 1 — Weeks 1–2**

---

## ✅ Completed Tasks (M5: QA / Documentation)

### 🔧 Test Environment Setup
- Installed **Vitest** and **React Testing Library**
- Configured **jsdom** testing environment
- Added `vitest.setup.js` and updated `vite.config.js`
- Verified Vitest detects all test files in `/src/tests/`

### 🧪 Authentication Flow Test Placeholders
Created initial working tests for:
- ✅ Email registration flow  
- ✅ Google OAuth provisioning  
- ✅ Login guard (INACTIVE user blocked)  
- ✅ Login guard (ACTIVE user allowed)  

These confirm the testing framework is ready for deeper Sprint 2 test cases.

### 📘 Documentation Work
- Updated **README.md** with complete setup instructions  
- Created **Sprint 1 Log** (this document)

---

## ✅ Blockers Encountered & Fixes

### ❌ 1. PowerShell blocking npm scripts  
✅ Fixed with:  

Set-ExecutionPolicy RemoteSigned

### ❌ 2. Vitest not recognized  
✅ Installed Vitest locally  
✅ Updated `package.json`:
"test": "npx vitest"

### ❌ 3. JSON errors in package.json  
✅ Fixed missing commas in `"scripts"` section  

### ❌ 4. Vitest not detecting test suites  
✅ Added proper `describe()` + `it()` blocks

## ✅ What Worked Successfully
- Vitest runs in watch mode  
- All placeholder tests pass  
- Test environment is stable and Sprint‑2 ready  
- Proper folder structure:

src/tests/

## ✅ Next Steps for Sprint 2

### 🧪 QA Testing
- Complete **18-case Rights Test Matrix**  
- Test soft-delete behavior  
- Test recovery visibility rules  
- Validate RLS protections  
- Validate stamp visibility  
- Confirm rights-based UI gating  

### 📘 Documentation
- Create Sprint 2 Log  
- Add test evidence screenshots  
- Update README if needed  

---

## ✅ Summary
Sprint 1 QA tasks successfully completed:  
- Test environment ✅  
- Initial auth test placeholders ✅  
- Documentation ✅  