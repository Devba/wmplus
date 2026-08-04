#!/bin/bash
# deploy-managereact.sh
# Despliega la app React W M+ a dev.hoa-e-solutions.com/managereactv1
# Uso: ./deploy-managereact.sh

set -e

VPS="alvaro@62.171.142.58"
REMOTE_DIR="/var/www/polydash/managereactv1"
LOCAL_DIST="./dist"

echo ""
echo "🚀 Desplegando W M+ React → managereactv1..."
echo ""

# 1. Crear directorio remoto
echo "📁 Creando directorio remoto (pedirá tu contraseña de sudo)..."
ssh -t -p 44 "$VPS" "sudo mkdir -p $REMOTE_DIR && sudo chown alvaro:alvaro $REMOTE_DIR"

# 2. Subir el build
echo "📤 Subiendo dist/ al VPS..."
rsync -avz -e "ssh -p 44" --delete \
  --exclude='.DS_Store' \
  "$LOCAL_DIST/" "$VPS:$REMOTE_DIR/"

# 3. Ajustar permisos
echo "🔒 Ajustando permisos..."
ssh -t -p 44 "$VPS" "sudo chown -R www-data:www-data $REMOTE_DIR && sudo chmod -R 755 $REMOTE_DIR"


echo ""
echo "✅ ¡Deploy completado!"
echo "   👉 https://dev.hoa-e-solutions.com/managereactv1"
echo ""
