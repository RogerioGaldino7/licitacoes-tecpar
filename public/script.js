document.getElementById('buscarBtn').addEventListener('click', buscarLicitacoes);

async function buscarLicitacoes() {
  const resultadoDiv = document.getElementById('resultado');
  const loading = document.getElementById('loading');

  loading.classList.remove('hidden');
  resultadoDiv.innerHTML = '';

  // 🔍 Filtros
  const palavrasChave = [
    "laboratório", "pesquisa científica", "análise laboratorial",
    "vacina", "tecnologia em saúde", "P&D", "desenvolvimento tecnológico",
    "medicamento", "monitoramento ambiental", "ensaios", "certificação técnica"
  ].join(" OR ");

  const valorMinimo = 500000;
  const orgaosPrioritarios = [
    "saúde", "seti", "iap", "sesa", "sanepar",
    "ciência", "tecnologia", "meio ambiente", "fundação", "pesquisa"
  ];

  const hoje = new Date().toISOString().split('T')[0];
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - 7);
  const inicioStr = inicio.toISOString().split('T')[0];

  const url = const url = `/api/pncp?uf=PR&palavra=${encodeURIComponent(palavrasChave)}&inicio=${inicioStr}&fim=${hoje}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro ${response.status}`);

    const dados = await response.json();
    const licitacoes = dados?.data || [];

    const licitacoesFiltradas = licitacoes.filter(licitacao => {
      const valor = parseFloat(licitacao.valorEstimado) || 0;
      const orgao = (licitacao.orgao || '').toLowerCase();
      return valor >= valorMinimo && orgaosPrioritarios.some(termo => orgao.includes(termo));
    });

    if (licitacoesFiltradas.length === 0) {
      resultadoDiv.innerHTML = '<p>Nenhuma licitação encontrada com base nos critérios (valor ≥ R$ 500.000 e órgãos estratégicos).</p>';
    } else {
      let tabela = `
        <p><strong>${licitacoesFiltradas.length} licitações relevantes encontradas</strong></p>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Órgão</th>
              <th>Objeto</th>
              <th>Valor</th>
              <th>Modalidade</th>
              <th>Situação</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
      `;

      licitacoesFiltradas.forEach(licitacao => {
        const valor = parseFloat(licitacao.valorEstimado).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
        const data = new Date(licitacao.dataPublicacao).toLocaleDateString('pt-BR');

        tabela += `
          <tr>
            <td>${data}</td>
            <td>${licitacao.orgao}</td>
            <td>${licitacao.objeto}</td>
            <td><strong>${valor}</strong></td>
            <td>${licitacao.modalidade}</td>
            <td>${licitacao.situacao}</td>
            <td><a href="${licitacao.link}" target="_blank">Ver Edital</a></td>
          </tr>
        `;
      });

      tabela += `</tbody></table>`;
      resultadoDiv.innerHTML = tabela;
    }
  } catch (error) {
    resultadoDiv.innerHTML = `<p style="color: red;">Erro ao buscar dados: ${error.message}</p>`;
    console.error(error);
  } finally {
    loading.classList.add('hidden');
  }
}