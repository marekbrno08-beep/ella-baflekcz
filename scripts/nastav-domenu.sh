#!/usr/bin/env bash
#
# Přepíše ve všech souborech webu placeholder doménu na tu skutečnou.
#
# Použití:
#   ./scripts/nastav-domenu.sh www.mojedomena.cz
#
set -euo pipefail

STARA="www.baflek.cz"
NOVA="${1:-}"

if [ -z "$NOVA" ]; then
  echo "Použití: $0 <domena-bez-https>   (např. www.baflek.cz)" >&2
  exit 1
fi

# Odstraní https:// a koncové lomítko, kdyby je někdo zadal
NOVA="${NOVA#http://}"
NOVA="${NOVA#https://}"
NOVA="${NOVA%/}"

cd "$(dirname "$0")/.."

SOUBORY=$(grep -rl "$STARA" --include='*.html' --include='*.xml' --include='*.txt' --include='*.json' --include='*.webmanifest' . || true)

if [ -z "$SOUBORY" ]; then
  echo "Nic k přepsání – doména už je nastavená jinak."
  exit 0
fi

echo "$SOUBORY" | while read -r f; do
  sed -i.bak "s|$STARA|$NOVA|g" "$f" && rm -f "$f.bak"
  echo "  ✓ $f"
done

echo
echo "Hotovo. Doména nastavena na: https://$NOVA/"
echo "Nezapomeň zkontrolovat i e-mailové adresy (ahoj@...) v index.html."
