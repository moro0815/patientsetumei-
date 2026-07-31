@echo off
rem ===================================================================
rem  せつめいナビを問診システム（monshin-tablet）の中に配置する
rem
rem    使い方:  install_to_monshin.bat C:\monshin-tablet
rem
rem  問診システムのフォルダに setsumei フォルダを作り、
rem  ビルド済みの dist の中身を入れます。
rem  同じサーバーからの配信になるため、CORS の設定なしで連携できます。
rem
rem  問診システム側のファイルは一切変更しません。
rem ===================================================================
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul 2>&1

rem --- このバッチの2つ上がリポジトリのルート -------------------------
set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%..\.." || (echo リポジトリのフォルダに移動できませんでした。& exit /b 1)
set "REPO_ROOT=%CD%"
popd

set "TARGET=%~1"
set "NAME=setsumei"
set "DO_BUILD=1"
set "FORCE=0"

if "%TARGET%"=="" goto :usage

shift
:parseargs
if "%~1"=="" goto :parsed
if /I "%~1"=="--name" (
  if "%~2"=="" (echo --name にフォルダ名を指定してください。& exit /b 1)
  set "NAME=%~2"
  shift & shift & goto :parseargs
)
if /I "%~1"=="--no-build" (set "DO_BUILD=0" & shift & goto :parseargs)
if /I "%~1"=="--force"    (set "FORCE=1"    & shift & goto :parseargs)
echo 不明なオプション: %~1
exit /b 1
:parsed

rem --- フォルダ名の安全確認 ------------------------------------------
echo(%NAME%| findstr /R "[\\/:]" >nul && (
  echo --name にはフォルダ名だけを指定してください: %NAME%
  exit /b 1
)
for %%N in (js css data img images assets templates static) do (
  if /I "%NAME%"=="%%N" (
    echo 「%NAME%」は問診システムが使っているフォルダ名です。別の名前にしてください。
    exit /b 1
  )
)

rem --- 配置先の確認 ---------------------------------------------------
if not exist "%TARGET%\" (
  echo フォルダが見つかりません: %TARGET%
  exit /b 1
)
pushd "%TARGET%" || exit /b 1
set "TARGET=%CD%"
popd

if not exist "%TARGET%\server.py" if not exist "%TARGET%\patient.html" (
  if "%FORCE%"=="1" (
    echo [注意] server.py / patient.html が見つかりませんが --force のため続行します。
  ) else (
    echo 問診システムのフォルダではないようです（server.py / patient.html がありません）:
    echo    %TARGET%
    echo 本当にここで良い場合は --force を付けてください。
    exit /b 1
  )
)

set "DEST=%TARGET%\%NAME%"
set "DIST=%REPO_ROOT%\dist"

rem --- ビルド ---------------------------------------------------------
if "%DO_BUILD%"=="1" (
  where npm >nul 2>&1 || (
    echo npm が見つかりません。Node.js を入れるか --no-build を使ってください。
    exit /b 1
  )
  echo ビルドしています... ^(%REPO_ROOT%^)
  pushd "%REPO_ROOT%" || exit /b 1
  call npm run build
  set "BUILD_RC=!ERRORLEVEL!"
  popd
  if not "!BUILD_RC!"=="0" (echo ビルドに失敗しました。& exit /b 1)
  echo [OK] ビルド完了
) else (
  echo ビルドを省略します ^(--no-build^)
)

if not exist "%DIST%\index.html" (
  echo ビルド結果が見つかりません: %DIST%\index.html
  echo 先に「npm install ^&^& npm run build」を実行してください。
  exit /b 1
)

rem --- 既存フォルダの退避 ---------------------------------------------
if exist "%DEST%\" (
  if not exist "%DEST%\index.html" if not "%FORCE%"=="1" (
    echo %DEST% に index.html がありません。
    echo せつめいナビ以外のフォルダを消してしまう恐れがあるため中止します。
    echo 本当に置き換える場合は --force を付けてください。
    exit /b 1
  )
  set "BACKUP=%DEST%.bak"
  set /a N=1
  :findbak
  if exist "!BACKUP!" (
    set "BACKUP=%DEST%.bak!N!"
    set /a N+=1
    goto :findbak
  )
  move /Y "%DEST%" "!BACKUP!" >nul || (echo 既存フォルダを退避できませんでした。& exit /b 1)
  echo [注意] 既存の %NAME% を "!BACKUP!" に退避しました
)

rem --- コピー ---------------------------------------------------------
mkdir "%DEST%" 2>nul
robocopy "%DIST%" "%DEST%" /E /NFL /NDL /NJH /NJS /NP >nul
if %ERRORLEVEL% GEQ 8 (
  echo コピーに失敗しました。
  exit /b 1
)
echo [OK] 配置しました: %DEST%

rem --- 案内 -----------------------------------------------------------
set "PORT=8090"
echo(
echo ------------------------------------------------
echo  配置が完了しました。
echo(
echo   1^) 問診システム ^(server.py^) を起動したままにしてください
echo   2^) 診察室PCのブラウザで次を開きます
echo(
echo        http://^(受付PCのIPアドレス^):%PORT%/%NAME%/
echo(
echo   3^) せつめいナビの 設定 ^> 問診システム・電子カルテとの連携
echo      ^> 「接続を確認する」で確認できます
echo      ^(問診システムのURL欄は空欄のままで構いません^)
echo(
echo  詳しくは deploy\monshin-integration\README.md をご覧ください。
echo ------------------------------------------------
exit /b 0

:usage
echo せつめいナビ ^> 問診システム 配置スクリプト
echo(
echo   使い方:
echo     %~nx0 ^<問診システムのフォルダ^> [オプション]
echo(
echo   例:
echo     %~nx0 C:\monshin-tablet
echo     %~nx0 C:\monshin-tablet --name setsumei
echo(
echo   オプション:
echo     --name ^<フォルダ名^>   配置先のフォルダ名 ^(既定: setsumei^)
echo     --no-build            npm run build を実行せず既存の dist をそのまま使う
echo     --force               問診システムらしいファイルが無くても続行する
echo(
echo   実行後、診察室PCのブラウザで
echo     http://^(受付PCのIPアドレス^):8090/setsumei/
echo   を開いてください。
exit /b 1
