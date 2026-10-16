const WHATSAPP_BARBEARIA = "5585989200913";
  const CHAVE_AGENDAMENTOS = "agendamentosBarbearia";
  let agendamentos = JSON.parse(localStorage.getItem(CHAVE_AGENDAMENTOS)) || [];

  

  const botaoMenu = document.getElementById("botao-menu");
  const menu    = document.getElementById("menu");
  botaoMenu.addEventListener("click", () => {
    menu.classList.toggle("aberto");
  });
  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => menu.classList.remove("aberto"));
  });
  function formatarDataISO(d) {
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mes}-${dia}`;
  }

  const hoje = formatarDataISO(new Date());
  const dataAmanha = formatarDataISO(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const OCUPADOS_DE_EXEMPLO = [
    { data: dataAmanha, horario: "09:00" },
    { data: dataAmanha, horario: "14:00" },
    { data: dataAmanha, horario: "14:30" },
  ];
  function estaOcupado(data, horario) {
    const nosReais    = agendamentos.some(a => a.data === data && a.horario === horario);
    const nosExemplos = OCUPADOS_DE_EXEMPLO.some(a => a.data === data && a.horario === horario);
    return nosReais || nosExemplos;
  }
  function salvarAgendamentos() {
    localStorage.setItem(CHAVE_AGENDAMENTOS, JSON.stringify(agendamentos));
  }

  

  const campoData    = document.getElementById("data");
  const campoHorario = document.getElementById("horario");
  const infoHorarios = document.getElementById("info-horarios");
  campoData.min = hoje;
  function horariosDoDia(dataEscolhida) {
    const dia = new Date(dataEscolhida + "T12:00:00").getDay();

    let inicio, fim;

    if (dia === 1) return [];
    if (dia === 0) { inicio = 8;  fim = 11.5; }
    else if (dia === 6) { inicio = 8; fim = 17.5; }
    else { inicio = 9; fim = 18.5; }

    const lista = [];
    for (let h = inicio; h <= fim; h += 0.5) {
      const hora = String(Math.floor(h)).padStart(2, "0");
      const min  = h % 1 === 0 ? "00" : "30";
      lista.push(`${hora}:${min}`);
    }
    return lista;
  }
  function montarHorarios() {
    const data = campoData.value;
    campoHorario.innerHTML = "";
    infoHorarios.textContent = "";

    if (!data) {
      campoHorario.innerHTML = '<option value="">— Escolha uma data primeiro —</option>';
      return;
    }
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "— Escolha um horário —";
    campoHorario.appendChild(placeholder);

    const doDia = horariosDoDia(data);
    if (doDia.length === 0) {
      placeholder.textContent = "Fechado às segundas-feiras";
      infoHorarios.textContent = "Não abrimos às segundas. Escolha outro dia. 🙂";
      return;
    }

    const agora = new Date();
    let livres = 0;

    for (const horario of doDia) {
      if (data === hoje) {
        const [h, m] = horario.split(":").map(Number);
        const dataHora = new Date();
        dataHora.setHours(h, m, 0, 0);
        if (dataHora <= agora) continue;
      }

      const opcao = document.createElement("option");

      if (estaOcupado(data, horario)) {
        opcao.disabled = true;
        opcao.textContent = `${horario} — ocupado`;
      } else {
        opcao.value = horario;
        opcao.textContent = horario;
        livres++;
      }

      campoHorario.appendChild(opcao);
    }
    if (livres === 0) {
      campoHorario.innerHTML = '<option value="">Sem horários livres neste dia</option>';
      infoHorarios.textContent = data === hoje
        ? "Os horários de hoje já passaram. Tente outra data."
        : "Esse dia está cheio! Tente outra data. 😕";
    } else {
      infoHorarios.textContent = `${livres} horário(s) livre(s) neste dia.`;
    }
  }
  campoData.addEventListener("change", montarHorarios);
  montarHorarios();

  

  const campoWhats = document.getElementById("whatsapp");

  campoWhats.addEventListener("input", () => {
    let numeros = campoWhats.value.replace(/\D/g, "").slice(0, 11);
    let formatado = numeros;
    if (numeros.length > 7) {
      formatado = `(${numeros.slice(0,2)}) ${numeros.slice(2,7)}-${numeros.slice(7)}`;
    } else if (numeros.length > 2) {
      formatado = `(${numeros.slice(0,2)}) ${numeros.slice(2)}`;
    } else if (numeros.length > 0) {
      formatado = `(${numeros}`;
    }

    campoWhats.value = formatado;
    campoWhats.classList.remove("invalido");
  });

  

  const form        = document.getElementById("formulario");
  const mensagemErro     = document.getElementById("mensagem-erro");
  const mensagemSucesso  = document.getElementById("mensagem-sucesso");

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const nome         = document.getElementById("nome").value.trim();
    const whatsapp     = campoWhats.value;
    const servico      = document.getElementById("servico").value;
    const profissional = document.getElementById("profissional").value;
    const data         = campoData.value;
    const horario      = campoHorario.value;
    mensagemErro.classList.remove("visivel");
    mensagemSucesso.classList.remove("visivel");

    if (nome === "") {
      return mostrarErro("Por favor, digite seu nome.", document.getElementById("nome"));
    }
    const digitosWhats = whatsapp.replace(/\D/g, "");
    if (digitosWhats.length < 10) {
      return mostrarErro("Digite um número de WhatsApp válido com DDD.", campoWhats);
    }

    if (servico === "") {
      return mostrarErro("Escolha um serviço.", document.getElementById("servico"));
    }

    if (data === "") {
      return mostrarErro("Escolha uma data para o agendamento.", campoData);
    }
    const diaSemana = new Date(data + "T12:00:00").getDay();
    if (diaSemana === 1) {
      return mostrarErro("Fechamos às segundas-feiras. Escolha outro dia.", campoData);
    }

    if (horario === "") {
      return mostrarErro("Escolha um horário.", campoHorario);
    }
    if (estaOcupado(data, horario)) {
      montarHorarios();
      return mostrarErro("Esse horário acabou de ser ocupado. Escolha outro, por favor.", campoHorario);
    }
    const [nomeServico, preco] = servico.split("|");
    const [ano, mes, dia] = data.split("-");
    const dataBonita = `${dia}/${mes}/${ano}`;

    const mensagem =
`*NOVO AGENDAMENTO — BARBEARIA DO ZÉ*
------------------------------
*Nome:* ${nome}
*WhatsApp:* ${whatsapp}
*Serviço:* ${nomeServico}
*Profissional:* ${profissional}
*Data:* ${dataBonita}
*Horário:* ${horario}
------------------------------
*Total:* R$ ${preco},00`;
    const link = `https://wa.me/${WHATSAPP_BARBEARIA}?text=${encodeURIComponent(mensagem)}`;
    agendamentos.push({ data, horario });
    salvarAgendamentos();
    window.open(link, "_blank");
    mensagemSucesso.textContent = "✅ Agendamento enviado! Se o WhatsApp não abriu, chame no (85) 98920-0913.";
    mensagemSucesso.classList.add("visivel");
    form.reset();
    montarHorarios();
  });
  function mostrarErro(texto, campo) {
    mensagemErro.textContent = texto;
    mensagemErro.classList.add("visivel");
    if (campo) campo.classList.add("invalido");
  }
