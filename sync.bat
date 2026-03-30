@echo off
:: ============================================================
:: sync.bat — IT Department + Alex one-command sync
:: Family Bridges (familybridges.org)
:: Run this at start of day (pull) or end of day (push)
:: Usage: sync.bat        → pulls latest from GitHub
::        sync.bat push   → commits + pushes changes
:: ============================================================

setlocal EnableDelayedExpansion

:: ── CONFIG ──────────────────────────────────────────────────
set ITOPS_DIR=%USERPROFILE%\ITOps
set ALEX_DIR=%USERPROFILE%\Alex
set TIMESTAMP=%DATE:~10,4%-%DATE:~4,2%-%DATE:~7,2% %TIME:~0,8%

echo.
echo ╔══════════════════════════════════════════════╗
echo ║  IT Department Sync — Family Bridges IT      ║
echo ╚══════════════════════════════════════════════╝
echo.

:: ── CHECK GIT IS INSTALLED ──────────────────────────────────
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git not found. Install from https://git-scm.com
    pause
    exit /b 1
)

:: ── DETERMINE MODE ──────────────────────────────────────────
if "%1"=="push" goto :PUSH_MODE
goto :PULL_MODE

:: ════════════════════════════════════════════════════════════
:: PULL MODE — start of day, get latest from GitHub
:: ════════════════════════════════════════════════════════════
:PULL_MODE
echo [MODE] Pulling latest from GitHub...
echo.

:: Pull ITOps repo
if exist "%ITOPS_DIR%\.git" (
    echo [ITOps] Pulling...
    cd /d "%ITOPS_DIR%"
    git pull origin main
    if %ERRORLEVEL% EQU 0 (
        echo [ITOps] ✓ Up to date
    ) else (
        echo [ITOps] ⚠ Pull had issues — check output above
    )
) else (
    echo [ITOps] Not found at %ITOPS_DIR% — cloning...
    git clone https://github.com/Ronny-Yee/IT-Department.git "%ITOPS_DIR%"
)

echo.

:: Pull Alex repo
if exist "%ALEX_DIR%\.git" (
    echo [Alex] Pulling...
    cd /d "%ALEX_DIR%"
    git pull origin main
    if %ERRORLEVEL% EQU 0 (
        echo [Alex] ✓ Up to date
    ) else (
        echo [Alex] ⚠ Pull had issues — check output above
    )
) else (
    echo [Alex] Not found at %ALEX_DIR% — cloning...
    git clone https://github.com/Ronny-Yee/Alex.git "%ALEX_DIR%"
)

echo.
echo ✓ Pull complete. Open ITOps in VS Code and start Claude Code.
echo.

:: Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠ Node.js not found — install from https://nodejs.org ^(v18+^)
) else (
    for /f "tokens=*" %%i in ('node --version') do echo   Node.js: %%i ✓
)

:: Check Claude Code
where claude >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠ Claude Code not installed — run: npm install -g @anthropic-ai/claude-code
) else (
    for /f "tokens=*" %%i in ('claude --version 2^>nul') do echo   Claude Code: %%i ✓
)

echo.
goto :END

:: ════════════════════════════════════════════════════════════
:: PUSH MODE — end of day, commit + push to GitHub
:: ════════════════════════════════════════════════════════════
:PUSH_MODE
echo [MODE] Pushing changes to GitHub...
echo.

set /p COMMIT_MSG="Commit message (or press Enter for auto): "
if "!COMMIT_MSG!"=="" set COMMIT_MSG=Auto-sync %TIMESTAMP%

:: Push ITOps repo
if exist "%ITOPS_DIR%\.git" (
    echo [ITOps] Committing and pushing...
    cd /d "%ITOPS_DIR%"
    git add -A
    git diff --cached --quiet
    if %ERRORLEVEL% EQU 0 (
        echo [ITOps] Nothing to commit — already up to date
    ) else (
        git commit -m "!COMMIT_MSG!"
        git push origin main
        if %ERRORLEVEL% EQU 0 (
            echo [ITOps] ✓ Pushed successfully
        ) else (
            echo [ITOps] ⚠ Push failed — check output above
        )
    )
) else (
    echo [ITOps] Not found at %ITOPS_DIR% — skipping
)

echo.

:: Push Alex repo
if exist "%ALEX_DIR%\.git" (
    echo [Alex] Committing and pushing...
    cd /d "%ALEX_DIR%"
    git add -A
    git diff --cached --quiet
    if %ERRORLEVEL% EQU 0 (
        echo [Alex] Nothing to commit — already up to date
    ) else (
        git commit -m "!COMMIT_MSG!"
        git push origin main
        if %ERRORLEVEL% EQU 0 (
            echo [Alex] ✓ Pushed successfully
        ) else (
            echo [Alex] ⚠ Push failed — check output above
        )
    )
) else (
    echo [Alex] Not found at %ALEX_DIR% — skipping
)

echo.
echo ✓ Push complete. Changes are live on GitHub.
echo.

:END
endlocal
pause
