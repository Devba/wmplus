#!/bin/bash
# deploy-managereact.sh
# Despliega la app React W M+ a dev.hoa-e-solutions.com/managereactv1
# Uso: ./deploy-managereact.sh

set -e

VPS="alvaro@62.171.142.58"
TARGET="${1:-backend}"

if [ "$TARGET" == "main" ]; then
  BASE_PATH="/managereactv1/"
  REMOTE_DIR="/var/www/polydash/managereactv1"
else
  BASE_PATH="/managereactv1-backend/"
  REMOTE_DIR="/var/www/polydash/managereactv1-backend"
fi

LOCAL_DIST="./dist"

echo ""
echo "🚀 Compilando y desplegando W M+ React ($TARGET) → $BASE_PATH..."
echo ""

# 1. Build con la ruta base adecuada
VITE_BASE_PATH="$BASE_PATH" npm run build

# 2. Crear directorio remoto
echo "📁 Creando directorio remoto..."
ssh -t -p 44 "$VPS" "sudo mkdir -p $REMOTE_DIR && sudo chown alvaro:alvaro $REMOTE_DIR"

# 3. Subir el build
echo "📤 Subiendo dist/ al VPS..."
rsync -avz -e "ssh -p 44" --delete \
  --exclude='.DS_Store' \
  "$LOCAL_DIST/" "$VPS:$REMOTE_DIR/"

# 4. Ajustar permisos
echo "🔒 Ajustando permisos..."
ssh -t -p 44 "$VPS" "sudo chown -R www-data:www-data $REMOTE_DIR && sudo chmod -R 755 $REMOTE_DIR"

echo ""
echo "✅ ¡Deploy completado para $TARGET!"
echo "   👉 http://62.171.142.58${BASE_PATH}"
echo ""
