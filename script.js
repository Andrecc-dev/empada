/**
 * SISTEMA DE ORÇAMENTO E PEDIDOS - DIVINA EMPADA (VERSÃO COMPLETA)
 * 
 * INSTRUÇÕES DE PREÇO:
 * Altere o valor de 'undefined' para o valor numérico desejado (Exemplo: 18.00).
 * Se o preço for 'undefined', o sistema exibirá "A consultar" no resumo.
 */

// 1. CONFIGURAÇÃO DOS PRODUTOS E SEUS PREÇOS (Edite os valores abaixo)
const PRECOS = {
    // Empadões / Marmitas Salgadas
    'frango_marmita': undefined,    // Ex: 18.00
    'carne_seca_marmita': undefined, // Ex: 22.00

    // Sobremesas & Doces
    'fondue_frutas': undefined,     // Ex: 16.00
    'banoffee_pequena': undefined,   // Ex: 13.00
    'banoffee_grande': undefined,    // Ex: 20.00
    'brigadeiro_pote': undefined     // Ex: 12.00
};

// Configuração do WhatsApp e Horário de Funcionamento
const CONFIG_LOJA = {
    numeroWhatsApp: "5527999107628", // Número configurado da loja
    horarioAbertura: 8,              // Horário de Abertura (08:00)
    horarioFechamento: 18            // Horário de Fechamento (18:00)
};

// 2. ESTADO DO CARRINHO
let carrinho = [];

// 3. INICIALIZAÇÃO DE EVENTOS
document.addEventListener('DOMContentLoaded', () => {
    inicializarMenuMobile();
    inicializarEventosFiltro();
    inicializarEventosSimulador();
    inicializarMascaraTelefone();
    verificarStatusLoja();
    inicializarFormularioContato();
});

/* ==========================================================================
   1. Navegação Mobile e Rolagem Suave
   ========================================================================== */
function inicializarMenuMobile() {
    const btnMenu = document.getElementById('mobile-menu-btn');
    const menuMobile = document.getElementById('mobile-menu');
    const linksMobile = document.querySelectorAll('.mobile-link');

    if (btnMenu && menuMobile) {
        btnMenu.addEventListener('click', () => {
            menuMobile.classList.toggle('hidden');
        });

        linksMobile.forEach(link => {
            link.addEventListener('click', () => {
                menuMobile.classList.add('hidden');
            });
        });
    }
}

/* ==========================================================================
   2. Status da Loja (Aberta/Fechada)
   ========================================================================== */
function verificarStatusLoja() {
    const horaAtual = new Date().getHours();
    const estaAberta = horaAtual >= CONFIG_LOJA.horarioAbertura && horaAtual < CONFIG_LOJA.horarioFechamento;
    
    const badgeStatus = document.createElement('div');
    badgeStatus.className = `fixed bottom-4 left-4 z-40 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 backdrop-blur-md ${
        estaAberta ? 'bg-emerald-600/90 text-white' : 'bg-stone-800/90 text-amber-200'
    }`;
    
    badgeStatus.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full ${estaAberta ? 'bg-emerald-300 animate-ping' : 'bg-amber-400'}"></span>
        <span>${estaAberta ? 'Loja Aberta para Pedidos' : 'Loja Fechada no Momento'}</span>
    `;

    document.body.appendChild(badgeStatus);
}

/* ==========================================================================
   3. Filtros do Cardápio
   ========================================================================== */
function inicializarEventosFiltro() {
    const botoesFiltro = document.querySelectorAll('.filter-btn');
    const itensMenu = document.querySelectorAll('.menu-item');

    botoesFiltro.forEach(botao => {
        botao.addEventListener('click', (e) => {
            const categoria = e.target.getAttribute('data-category') || 'todos';

            botoesFiltro.forEach(btn => {
                btn.classList.remove('bg-brand-gold', 'text-white', 'active');
                btn.classList.add('bg-white', 'text-gray-700');
            });
            e.target.classList.remove('bg-white', 'text-gray-700');
            e.target.classList.add('bg-brand-gold', 'text-white', 'active');

            itensMenu.forEach(item => {
                if (categoria === 'todos' || item.classList.contains(categoria)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

/* ==========================================================================
   4. Lógica do Carrinho / Orçamento
   ========================================================================== */
function adicionarAoCarrinho(chavePreco, nomeItem, botaoEl) {
    const preco = PRECOS[chavePreco];
    const indiceExistente = carrinho.findIndex(item => item.chave === chavePreco);

    if (indiceExistente > -1) {
        carrinho[indiceExistente].qtd += 1;
    } else {
        carrinho.push({
            chave: chavePreco,
            nome: nomeItem,
            preco: preco,
            qtd: 1
        });
    }

    // Feedback visual no botão
    if (botaoEl) {
        const textoOriginal = botaoEl.innerHTML;
        botaoEl.innerHTML = `<i class="fa-solid fa-check"></i> Adicionado!`;
        botaoEl.classList.add('bg-emerald-600');
        setTimeout(() => {
            botaoEl.innerHTML = textoOriginal;
            botaoEl.classList.remove('bg-emerald-600');
        }, 1200);
    }

    atualizarVisualCarrinho();
}

function alterarQuantidade(index, mudanca) {
    carrinho[index].qtd += mudanca;
    if (carrinho[index].qtd <= 0) {
        carrinho.splice(index, 1);
    }
    atualizarVisualCarrinho();
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    atualizarVisualCarrinho();
}

function atualizarVisualCarrinho() {
    const container = document.getElementById('cart-items-container');
    const elTotalQtd = document.getElementById('total-qty');
    const elTotalPreco = document.getElementById('total-price');

    if (!container) return;

    if (carrinho.length === 0) {
        container.innerHTML = `<p class="text-amber-200/70 text-sm text-center py-4">Sua lista está vazia. Selecione os itens no cardápio acima.</p>`;
        if (elTotalQtd) elTotalQtd.innerText = "0 un";
        if (elTotalPreco) elTotalPreco.innerText = "R$ 0,00";
        return;
    }

    let html = '';
    let totalUnidades = 0;
    let valorTotal = 0;
    let possuiPrecoUndefined = false;

    carrinho.forEach((item, index) => {
        totalUnidades += item.qtd;
        
        let textoPrecoUnitario = '';
        if (item.preco !== undefined && item.preco !== null) {
            const subtotal = item.preco * item.qtd;
            valorTotal += subtotal;
            textoPrecoUnitario = `R$ ${item.preco.toFixed(2).replace('.', ',')} un`;
        } else {
            possuiPrecoUndefined = true;
            textoPrecoUnitario = 'Preço a consultar';
        }

        html += `
            <div class="flex items-center justify-between bg-white/10 px-3 py-2 rounded-lg text-sm mb-2">
                <div class="truncate max-w-[180px]">
                    <span class="font-bold text-amber-200 block truncate">${item.nome}</span>
                    <span class="text-xs text-amber-100/70 block">${textoPrecoUnitario}</span>
                </div>
                <div class="flex items-center gap-2">
                    <button type="button" onclick="alterarQuantidade(${index}, -1)" class="w-6 h-6 bg-white/20 hover:bg-white/30 rounded text-xs text-white font-bold">-</button>
                    <span class="font-bold text-white text-xs">${item.qtd}</span>
                    <button type="button" onclick="alterarQuantidade(${index}, 1)" class="w-6 h-6 bg-white/20 hover:bg-white/30 rounded text-xs text-white font-bold">+</button>
                    <button type="button" onclick="removerDoCarrinho(${index})" class="text-red-300 hover:text-red-200 ml-2 text-xs" title="Remover">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    if (elTotalQtd) elTotalQtd.innerText = `${totalUnidades} un`;
    
    if (elTotalPreco) {
        if (possuiPrecoUndefined) {
            elTotalPreco.innerText = "A consultar";
        } else {
            elTotalPreco.innerText = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
        }
    }
}

/* ==========================================================================
   5. Formatação de Telefone (Máscara Automática)
   ========================================================================== */
function inicializarMascaraTelefone() {
    const inputsTelefone = document.querySelectorAll('input[type="tel"]');
    inputsTelefone.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length > 6) {
                e.target.value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
            } else if (value.length > 2) {
                e.target.value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
            } else if (value.length > 0) {
                e.target.value = `(${value}`;
            }
        });
    });
}

/* ==========================================================================
   6. Envio de Mensagem Direta do Formulário de Contato para o WhatsApp
   ========================================================================== */
function inicializarFormularioContato() {
    const formContato = document.getElementById('form-contato');
    if (!formContato) return;

    formContato.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('contato-nome')?.value.trim() || 'Não informado';
        const telefone = document.getElementById('contato-tel')?.value.trim() || 'Não informado';
        const mensagemTexto = document.getElementById('contato-msg')?.value.trim() || 'Sem mensagem';

        let mensagemWhatsApp = `*NOVA MENSAGEM DO SITE (FALE CONOSCO)*\n\n`;
        mensagemWhatsApp += `*Nome:* ${nome}\n`;
        mensagemWhatsApp += `*Telefone/WhatsApp:* ${telefone}\n\n`;
        mensagemWhatsApp += `*Mensagem/Dúvida:*\n${mensagemTexto}`;

        const textoCodificado = encodeURIComponent(mensagemWhatsApp);
        window.open(`https://wa.me/${CONFIG_LOJA.numeroWhatsApp}?text=${textoCodificado}`, '_blank');
        
        formContato.reset();
    });
}

/* ==========================================================================
   7. Integração / Envio WhatsApp (Simulador)
   ========================================================================== */
function inicializarEventosSimulador() {
    const btnWhatsapp = document.getElementById('btn-send-whatsapp');
    if (btnWhatsapp) {
        btnWhatsapp.addEventListener('click', enviarOrcamentoWhatsApp);
    }
}

function enviarOrcamentoWhatsApp() {
    if (carrinho.length === 0) {
        alert("Por favor, adicione pelo menos um item ao seu orçamento antes de enviar!");
        return;
    }

    const optRequeijao = document.getElementById('opt-requeijao')?.value || 'Com Requeijão';
    const optMucarela = document.getElementById('opt-mucarela')?.value || 'Com Muçarela';
    const optFondueFruta = document.getElementById('opt-fondue-fruta')?.value || 'Não se aplica';
    const observacoes = document.getElementById('sim-obs')?.value.trim() || 'Nenhuma';

    let totalQtd = 0;
    let valorTotal = 0;
    let possuiPrecoUndefined = false;

    let mensagem = `*SOLICITAÇÃO DE ORÇAMENTO - DIVINA EMPADA*\n\n`;
    mensagem += `*Itens Selecionados:*\n`;

    carrinho.forEach(item => {
        totalQtd += item.qtd;
        if (item.preco !== undefined && item.preco !== null) {
            const subtotal = item.preco * item.qtd;
            valorTotal += subtotal;
            mensagem += `• ${item.qty || item.qtd}x ${item.nome} (R$ ${subtotal.toFixed(2).replace('.', ',')})\n`;
        } else {
            possuiPrecoUndefined = true;
            mensagem += `• ${item.qty || item.qtd}x ${item.nome} (Preço a consultar)\n`;
        }
    });

    mensagem += `\n*Preferências do Empadão:*`;
    mensagem += `\n- Requeijão: ${optRequeijao}`;
    mensagem += `\n- Queijo: ${optMucarela}`;

    const temFondue = carrinho.some(item => item.chave === 'fondue_frutas');
    if (temFondue) {
        mensagem += `\n- Frutas do Fondue: ${optFondueFruta}`;
    }

    mensagem += `\n\n*Total de Itens:* ${totalQtd}`;

    if (possuiPrecoUndefined) {
        mensagem += `\n*Valor Estimado:* A consultar no atendimento`;
    } else {
        mensagem += `\n*Valor Estimado:* R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
    }

    if (observacoes !== 'Nenhuma') {
        mensagem += `\n\n*Observações/Endereço:* ${observacoes}`;
    }

    const textoCodificado = encodeURIComponent(mensagem);
    window.open(`https://wa.me/${CONFIG_LOJA.numeroWhatsApp}?text=${textoCodificado}`, '_blank');
}