Assets exportados do Google Stitch (tela "Trilha de Aprendizado", projeto DevCode Journey).

Para gerar screen.png e screen.html na raiz desta pasta:

1. Crie uma API key em https://stitch.withgoogle.com/settings
2. Na raiz do monorepo:
   PowerShell:  $env:STITCH_API_KEY="sua-chave"; npm run stitch:fetch-screen

IDs padrão: projeto 12725512160423672178, tela e884a0b4d9f4492ab5bd0f6b397d6f74.
Opcional: STITCH_PROJECT_ID e STITCH_SCREEN_ID para outros recursos.
