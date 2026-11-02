// Inicialização global garantida do cliente Supabase caso não tenha sido instanciado
if (!window.supabaseClient && window.supabase) {
  const SUPABASE_URL = "https://mtipyhwprnjniexgcsrs.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_vfW6skkVpWjFNA-DOpltVA_O3wQ2Y8d";
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

async function salvarPagina(nomePagina, htmlConteudo) {
  const client = window.supabaseClient || window.supabase;
  const userEmail = localStorage.getItem("user_email") || "admin@rpa.com";

  // 1. Consulta o perfil do usuário logado
  const { data: usuario, error: userErr } = await client
    .from('solucao_usuarios')
    .select('perfil')
    .eq('login', userEmail)
    .single();

  if (userErr || !usuario) {
    alert("Erro ao validar permissões do usuário.");
    return;
  }

  const isAdmin = usuario.perfil === 'ADMIN';
  const paginasPrincipais = ['index', 'chat', 'conheca', 'painel'];

  // 2. Validação de bloqueio de segurança no Front-end
  if (!isAdmin && paginasPrincipais.includes(nomePagina.toLowerCase())) {
    alert("⛔ Permissão negada: Apenas administradores podem modificar as páginas principais do sistema.");
    return;
  }

  // 3. Verifica se a página já existe e pertence a outro usuário (se não for admin)
  if (!isAdmin) {
    const { data: paginaExistente } = await client
      .from('paginas_criadas')
      .select('usuario')
      .eq('nome_pagina', nomePagina)
      .single();

    if (paginaExistente && paginaExistente.usuario !== userEmail) {
      alert("⛔ Você só pode salvar e alterar páginas criadas por você!");
      return;
    }
  }

  // 4. Salva ou atualiza a página no Supabase
  const { data, error } = await client
    .from('paginas_criadas')
    .upsert({
      usuario: userEmail,
      nome_pagina: nomePagina,
      codigo_fonte_html: htmlConteudo,
      status: 'publicada',
      atualizado_em: new Date()
    }, { onConflict: 'nome_pagina' });

  if (error) {
    alert("Erro ao salvar no Supabase: " + error.message);
  } else {
    alert(`Página '${nomePagina}' salva com sucesso! 🎉`);
  }
}