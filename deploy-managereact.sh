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
elif [ "$TARGET" == "bravo" ] || [ "$TARGET" == "BravoFrontend" ]; then
  BASE_PATH="/manage-Bravofrontend/"
  REMOTE_DIR="/var/www/polydash/manage-Bravofrontend"
else
  BASE_PATH="/managereactv1-backend/"
  REMOTE_DIR="/var/www/polydash/managereactv1-backend"
fi

LOCAL_DIST="./dist"

echo ""
echo "🚀 Compilando y desplegando W M+ React ($TARGET) → $BASE_PATH..."
echo ""

# 1. Build con la ruta base adecuada
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
VITE_BASE_PATH="$BASE_PATH" VITE_GIT_COMMIT="$GIT_COMMIT" VITE_GIT_BRANCH="$GIT_BRANCH" npm run build

# 2. Crear directorio remoto
echo "📁 Creando directorio remoto..."
ssh -p 44 "$VPS" "mkdir -p $REMOTE_DIR"

# 3. Subir el build
echo "📤 Subiendo dist/ al VPS..."
rsync -avz -e "ssh -p 44" --delete \
  --exclude='.DS_Store' \
  "$LOCAL_DIST/" "$VPS:$REMOTE_DIR/"

# 4. Ajustar permisos
echo "🔒 Ajustando permisos..."
ssh -p 44 "$VPS" "chmod -R 755 $REMOTE_DIR"

echo ""
echo "✅ ¡Deploy completado para $TARGET!"
echo "   👉 http://62.171.142.58${BASE_PATH}"
echo ""
