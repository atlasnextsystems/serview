# Diretrizes do Agente Antigravity

## Lógica de Negócio e Acesso a Dados

- **Lógica e Acesso a Dados apenas no Backend (Cloud Functions)**: Toda a lógica de negócio e consultas/escritas a banco de dados (Firestore) devem ser realizadas exclusivamente através das Firebase Cloud Functions.
- **Frontend Sem Acesso Direto**: O frontend (Next.js) jamais deve ler ou gravar no Firestore usando o client SDK diretamente. Ele deve se comunicar com o backend utilizando chamadas `onCall` seguras e tipadas.
