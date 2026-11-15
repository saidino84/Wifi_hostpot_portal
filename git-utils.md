git config --global user.email "58900154+saidino84@users.noreply.github.com" //noreplay email
git config --global user.name "seu_nome_ou_usuario"

gh auth login
gh repo create --public --source=. --push

git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
git push -u origin main