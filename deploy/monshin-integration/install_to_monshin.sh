#!/usr/bin/env bash
#
# せつめいナビを問診システム（monshin-tablet）の中に配置するスクリプト
#
#   使い方:  ./deploy/monshin-integration/install_to_monshin.sh /path/to/monshin-tablet
#
# 問診システムのフォルダに setsumei/ を作り、ビルド済みの dist/ の中身を入れます。
# 同じサーバーからの配信になるため、CORS の設定なしで連携できます。
#
# 問診システム側のファイルは一切変更しません。
#
set -euo pipefail

RED=$'\033[31m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; BOLD=$'\033[1m'; OFF=$'\033[0m'
say()  { printf '%s\n' "$*"; }
ok()   { printf '%s✓ %s%s\n' "$GREEN" "$*" "$OFF"; }
warn() { printf '%s! %s%s\n' "$YELLOW" "$*" "$OFF"; }
die()  { printf '%s✗ %s%s\n' "$RED" "$*" "$OFF" >&2; exit 1; }

# ── リポジトリのルート（このスクリプトの2つ上）────────────────────────────
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd -- "$SCRIPT_DIR/../.." && pwd)

TARGET=${1:-}
if [ -z "$TARGET" ]; then
  cat <<EOS
${BOLD}せつめいナビ → 問診システム 配置スクリプト${OFF}

  使い方:
    $0 <問診システムのフォルダ> [オプション]

  例:
    $0 ~/monshin-tablet
    $0 /opt/monshin-tablet --name setsumei

  オプション:
    --name <フォルダ名>   配置先のフォルダ名（既定: setsumei）
    --no-build            npm run build を実行せず、既存の dist/ をそのまま使う
    --force               問診システムらしいファイルが見つからなくても続行する

  実行後、診察室PCのブラウザで
    http://（受付PCのIPアドレス）:8090/setsumei/
  を開いてください。
EOS
  exit 1
fi

NAME=setsumei
DO_BUILD=1
FORCE=0
shift
while [ $# -gt 0 ]; do
  case "$1" in
    --name)     NAME=${2:-}; [ -n "$NAME" ] || die "--name にフォルダ名を指定してください。"; shift 2 ;;
    --no-build) DO_BUILD=0; shift ;;
    --force)    FORCE=1; shift ;;
    *)          die "不明なオプション: $1" ;;
  esac
done

case "$NAME" in
  */*|.|..) die "--name にはフォルダ名だけを指定してください（/ は使えません）: $NAME" ;;
esac

# ── 配置先の確認 ──────────────────────────────────────────────────────────
[ -d "$TARGET" ] || die "フォルダが見つかりません: $TARGET"
TARGET=$(cd -- "$TARGET" && pwd)

if [ ! -f "$TARGET/server.py" ] && [ ! -f "$TARGET/patient.html" ]; then
  if [ "$FORCE" -eq 1 ]; then
    warn "問診システムのファイル（server.py / patient.html）が見つかりませんが、--force のため続行します。"
  else
    die "問診システムのフォルダではないようです（server.py / patient.html がありません）: $TARGET
    本当にここで良い場合は --force を付けてください。"
  fi
fi

DEST="$TARGET/$NAME"

# 取り違え事故の防止：問診システム本体のフォルダを上書きしない
case "$NAME" in
  js|css|data|img|images|assets|templates|static) die "「$NAME」は問診システムが使っているフォルダ名です。別の名前にしてください。" ;;
esac

# ── ビルド ────────────────────────────────────────────────────────────────
DIST="$REPO_ROOT/dist"
if [ "$DO_BUILD" -eq 1 ]; then
  command -v npm >/dev/null 2>&1 || die "npm が見つかりません。Node.js を入れるか --no-build を使ってください。"
  say "${BOLD}ビルドしています…${OFF}（$REPO_ROOT）"
  ( cd "$REPO_ROOT" && npm run build )
  ok "ビルド完了"
else
  say "ビルドを省略します（--no-build）"
fi

[ -f "$DIST/index.html" ] || die "ビルド結果が見つかりません: $DIST/index.html
  先に「npm install && npm run build」を実行してください。"

# ── 既存フォルダのバックアップ ────────────────────────────────────────────
if [ -e "$DEST" ]; then
  [ -d "$DEST" ] || die "$DEST がフォルダではありません。手で確認してください。"
  # 既存が「せつめいナビの配置先」であることを確かめてから消す
  if [ ! -f "$DEST/index.html" ] && [ "$FORCE" -eq 0 ]; then
    die "$DEST に index.html がありません。せつめいナビ以外のフォルダを消してしまう恐れがあるため中止します。
    本当に置き換える場合は --force を付けてください。"
  fi
  BACKUP="$DEST.bak"
  n=1
  while [ -e "$BACKUP" ]; do BACKUP="$DEST.bak$n"; n=$((n + 1)); done
  mv -- "$DEST" "$BACKUP"
  warn "既存の $NAME/ を $(basename -- "$BACKUP")/ に退避しました"
fi

# ── コピー ────────────────────────────────────────────────────────────────
mkdir -p -- "$DEST"
if command -v rsync >/dev/null 2>&1; then
  rsync -a -- "$DIST"/ "$DEST"/
else
  cp -R -- "$DIST"/. "$DEST"/
fi
ok "配置しました: $DEST"

# ── 動作の目安を表示 ──────────────────────────────────────────────────────
PORT=8090
if [ -f "$TARGET/server.py" ]; then
  # 「PORT = 8090」も「PORT = int(os.environ.get("PORT", "8090"))」も拾えるように、
  # PORT を定義している行の最後の数値を使う
  p=$(grep -E '^[[:space:]]*PORT[[:space:]]*=' "$TARGET/server.py" 2>/dev/null | head -n1 |
      grep -Eo '[0-9]{2,5}' | tail -n1 || true)
  [ -n "${p:-}" ] && PORT=$p
fi

IP=""
if command -v hostname >/dev/null 2>&1; then IP=$(hostname -I 2>/dev/null | awk '{print $1}'); fi
[ -n "$IP" ] || IP="（受付PCのIPアドレス）"

cat <<EOS

${BOLD}────────────────────────────────────────────────${OFF}
 配置が完了しました。

 1) 問診システム（server.py）を起動したままにしてください
 2) 診察室PCのブラウザで次を開きます

      ${BOLD}http://$IP:$PORT/$NAME/${OFF}

 3) せつめいナビの ⚙️ 設定 →「問診システム・電子カルテとの連携」
    →「接続を確認する」で確認できます
    （問診システムのURL欄は空欄のままで構いません）

 詳しくは deploy/monshin-integration/README.md をご覧ください。
${BOLD}────────────────────────────────────────────────${OFF}
EOS
