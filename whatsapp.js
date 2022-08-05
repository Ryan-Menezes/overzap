const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, LegacySessionAuth } = require('whatsapp-web.js');
const Restaurante = require('./src/models/restaurante.model');
const Cliente = require('./src/models/cliente.model');
const Contexto = require('./src/models/contexto.model');
const Produto = require('./src/models/produto.model');
const Pedido = require('./src/models/pedido.model');
const PedidoProduto = require('./src/models/pedidoProduto.model');

// Path where the session data will be stored
const SESSION_FILE_PATH = process.env.SESSION_FILE_PATH;

// Load the session data if it has been previously saved
let sessionConfig;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionConfig = require(SESSION_FILE_PATH);
}

// Use the saved values
const client = new Client({
    authStrategy: new LocalAuth(),
});

/*
const client = new Client({
    authStrategy: new LegacySessionAuth({
        session: sessionConfig
    }),
});

client.on('authenticated', session => {
    sessionConfig = session;
	fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), err => {
		if (err) {
			console.error('Falha ao gravar token');
		}
	});
});
*/

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('auth_failure', session => {
	sessionConfig = '';
	fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), err => {
		if (err) {
			console.error('Falha ao gravar token');
		}
	});
});

client.on('message', msg => {
    let [ phone, type ] =  msg.from.split('@');
	phone = phone.substring(2);

	if (type === 'c.us') {
		clientMessage(phone, msg);
	}
});

client.initialize();


// Método que envia a mensagem
const sendMessage = async (phone, message) => {
	phone = `55${phone}@c.us`;
	message = message || 'Algo deu errado com a mensagem';

	try {
		//await client.sendMessage(phone, message);
		console.log(phone, message);
	} catch(err) {
		console.log(err);
	}
};

// Método de boas vindas
const welcomeMessage = async cliente => {
	const restaurante = await Restaurante.findById(cliente.restauranteId);

	const mensagem = `Olá, eu sou o bot de atendimento do ${restaurante.nome} e estou aui para lhe ajudar!
		\nDigite a opção desejada:\n
		- *Cardápio*;
		- *Instruções*;
		- *Pedido*;
		- *Cancelar*;
		- *Finalizar*;
		\nPara cadastrar seu endereço basta mandar a localização.`;

	sendMessage(cliente.telefone, mensagem);
};

// Método para lidar com finalização ou cancelamento de pedido

// Método para quando o bot não entende
const notUnderstandMessage = cliente => {
	sendMessage(cliente.telefone, 'Desculpe, não consegui entender o que você disse. Digite *instruções para ver comoe me usar!');
};

// Método para pegar os produtos de um restaurante e mandar o cardápio
const menuMessage = async (cliente, contexto) => {
	// Mudar o contexto para inical
	await Contexto.findByIdAndUpdate(contexto._id, {
		tipo: 'initial',
	});

	const menu = await Produto.find({
		restauranteId: cliente.restauranteId,
		situacao: 'A',
	})
	.sort('categoriaId');

	let message = '';
	menu.forEach((item, index) => {
		message += `${index + 1}. ${item.nome} - R$${item.valor}\n`
		message += item.descricao ? `_${item.descricao}_\n\n` : '\n';
	});
	message += `\n Para adicionar um item ao carrinho basta informar o número dele!
	\nSe você quiser adicionar mais de um item do mesmo produto basta informar o produto x quantidade
	\nEx: 1x3 - 3 itens do produto número 1
	`;

	sendMessage(cliente.telefone, message);
};

// Método para confirmar a ação
const confirmMessage = async (cliente, contexto) => {
	let pedido;

	// Mudar o contexto para cancel
	await Contexto.findByIdAndUpdate(contexto._id, {
		tipo: 'initial',
	});

	switch (contexto.tipo) {
		case 'cancel':
			pedido = await Pedido.findOneAndUpdate(
				{
					clienteId: cliente._id,
					situacao: 'A',
				},
				{
					$set: {
						situacao: 'C',
					},
				},
			);

			if (pedido) {
				sendMessage(cliente.telefone, 'Seu pedido foi cancelado com sucesso!');
			} else {
				sendMessage(cliente.telefone, 'Desculpe, não encontramos seu pedido!');
			}

			break;
		case 'finish':
			pedido = await Pedido.findOneAndUpdate(
				{
					clienteId: cliente._id,
					situacao: 'A',
				},
				{
					$set: {
						situacao: 'F',
					},
				},
			).populate('restauranteId');

			if (pedido) {
				sendMessage(cliente.telefone, 'Seu pedido foi finalizado com sucesso!');
				sendMessage(cliente.telefone, `Nós da ${pedido.restauranteId.nome} agradecemos a preferência!`);
			} else {
				sendMessage(cliente.telefone, 'Desculpe, não encontramos seu pedido!');
			}
			
			break;
		default:
			notUnderstandMessage(cliente);
	}
};

// Método para negar a ação
const denyMessage = async (cliente, contexto) => {
	// Mudar o contexto para cancel
	await Contexto.findByIdAndUpdate(contexto._id, {
		tipo: 'initial',
	});

	switch (contexto.tipo) {
		case 'cancel':
			sendMessage(cliente.telefone, 'Ok, continue seu pedido e digite *finalizar* para finalizar o pedido');
			break;
		case 'finish':
			sendMessage(cliente.telefone, 'Ok, continue seu pedido e digite *finalizar* para finalizar o pedido');
			break;
		default:
			notUnderstandMessage(cliente);
	}
};

// Método para ver o pedido com os itens adicionados
const orderMessage = async (cliente, contexto) => {
	// Mudar o contexto para inical
	await Contexto.findByIdAndUpdate(contexto._id, {
		tipo: 'initial',
	});

	const pedido = await Pedido.findOne({
		clienteId: cliente._id,
		situacao: 'A',
	});

	if (!pedido) {
		return sendMessage(cliente.telefone, `Não há pedidos em aberto em nome de ${cliente.nome}`);
	}

	const pedidoItens = await PedidoProduto.find({
		pedidoId: pedido._id,
	}).populate('produtoId');

	if (!pedidoItens.length) {
		return sendMessage(cliente.telefone, `Não há produtos no pedido em nome de ${cliente.nome}`);
	}

	let message = '';
	let total = 0;

	pedidoItens.forEach(item => {
		const subtotal = item.valorUnitario * item.quantidade;
		total += subtotal;
		message += `${item.quantidade} x ${item.productId.nome} = R$${parseFloat(subtotal.fixed(2))}\n`;
	});

	message += `*Total:* _R$${parseFloat(total.fixed(2))}_`;

	sendMessage(cliente.telefone, message);
};

// Método que vai iniciar o cancelamento do pedido
const cancelMessage = async (cliente, contexto) => {
	const pedido = await Pedido.findOne({
		clienteId: cliente._id,
		situacao: 'A',
	});

	if (!pedido) {
		return sendMessage(cliente.telefone, `Não há pedidos em aberto em nome de ${cliente.nome}`);
	}

	// Mudar o contexto para cancel
	await Contexto.findByIdAndUpdate(contexto._id, {
		tipo: 'cancel',
	});

	sendMessage(cliente.telefone, `Tem certeza que deseja cancelar o pedido: (Sim ou Não)`);
};

// Método para lidar com as mensagens não reservadas do bot que são baseadas no contexto
const defaultMessage = async (cliente, contexto, text) => {
	switch (contexto.tipo) {
		case 'welcome':
			// Mudar o contexto para inical
			await Contexto.findByIdAndUpdate(contexto._id, {
				tipo: 'initial',
			});

			// Mandar mensagem de boas vindas
			welcomeMessage(cliente);
			break;
		case 'initial':
			let produto, quantidade = 1;

			try {
				if (text.indexOf('x') > -1) {
					[produto, quantidade] = text.split('x');
				} else {
					produto = text;
				}

				const menu = await Produto.find({
					restauranteId: cliente.restauranteId,
					situacao: 'A',
				})
				.sort('categoriaId');

				produto = menu[parseInt(produto) - 1];

				let pedido = await Pedido.findOne({
					clienteId: cliente._id,
					situacao: 'A',
				});

				if (!pedido) {
					pedido = await Pedido.create({
						restauranteId: cliente.restauranteId,
						clienteId: cliente._id,
					});
				}

				await PedidoProduto.create({
					pedidoId: pedido._id,
					produtoId: produto._id,
					valorUnitario: produto.valor,
					quantidade: parseInt(quantidade),
				});

				sendMessage(cliente.telefone, `${quantidade} *${product.nome}* adicionado ao carrinho`);
			} catch {
				sendMessage(cliente.telefone, 'Este produto não existe, digite uma das opções no cardápio, caso queira, digite instrucões para ver o cardápio');
			}

			break;
		case 'finish':
			
			break;
		case 'address':
			// Mudar o contexto para inical
			await Contexto.findByIdAndUpdate(contexto._id, {
				tipo: 'initial',
			});

			// Atualizar número da residência
			await Cliente.findByIdAndUpdate(
				cliente._id,
				{
					$set: {
						endereco: {
							numero: text,
						},
					},
				},
			);

			sendMessage(cliente.telefone, 'Número do endereço atualizado com sucesso!');
			break;
		case 'cancel':
			
			break;
		default:
			notUnderstandMessage(cliente);
			break;
	}
};

// Esse método vai iniciar a finalização
const finishMessage = async (cliente, contexto) => {
	// Mudar o contexto para inical
	await Contexto.findByIdAndUpdate(contexto._id, {
		tipo: 'initial',
	});

	const [latitude = null, longitude = null] = cliente.endereco.coordinates;

	if (!latitude || !longitude || !cliente.endereco.numero) {
		return sendMessage(cliente.telefone, 'Para finalizar o pedido precisamos do seu endereço, mande a sua localização e em seguida o número');
	}

	// Mudar o contexto para finish
	await Contexto.findByIdAndUpdate(contexto._id, {
		tipo: 'finish',
	});

	const pedido = await Pedido.findOne({
		clienteId: cliente._id,
		situacao: 'A',
	});

	if (!pedido) {
		return sendMessage(cliente.telefone, `Não há pedidos em aberto em nome de ${cliente.nome}`);
	}

	const pedidoItens = await PedidoProduto.find({
		pedidoId: pedido._id,
	}).populate('produtoId');

	if (!pedidoItens.length) {
		return sendMessage(cliente.telefone, `Não há produtos no pedido em nome de ${cliente.nome}`);
	}

	let message = '';
	let total = 0;

	pedidoItens.forEach(item => {
		const subtotal = item.valorUnitario * item.quantidade;
		total += subtotal;
		message += `${item.quantidade} x ${item.productId.nome} = R$${parseFloat(subtotal.fixed(2))}\n`;
	});

	message += `*Total:* _R$${parseFloat(total.fixed(2))}_`;

	sendMessage(cliente.telefone, message);
	sendMessage(cliente.telefone, 'Deseja confirmar o pedido: (Sim ou Não)');
};

// Todas as mensagens passam por esta função
const clientMessage = async (phone, msg) => {
	// Pegar o número para qual a mensagem está sendo enviada
	let [ restauranteTel, ] = msg.to.split('@');

	// Formata o número do restaurante sem o 55
	restauranteTel = restauranteTel.substring(2);

	// Pegar o número de quem está enviando a mensagem
	let [ clienteTel, ] = msg.from.split('@');

	// Formata o número do cliente sem o 55
	clienteTel = clienteTel.substring(2);

	// Consultar se o restaurante existe no bd
	const restaurante = await Restaurante.findOne({
		telefone: restauranteTel,
	});

	if (!restaurante) {
		console.log('O restautante não existe');
		return;
	}

	// Verificar se o cliente existe nesse restaurante
	let cliente = await Cliente.findOne({
		telefone: clienteTel,
		restauranteId: restaurante._id,
	});

	if (!cliente) {
		const contato = await msg.getContact();
		cliente = await Cliente.create({
			nome: contato.pushname || contato.verifiedName,
			telefone: clienteTel,
			restauranteId: restaurante._id,
		});
		return;
	}

	// Buscar contexto do usuário
	let contexto = await Contexto.findOne({
		clienteId: cliente._id,
	});

	// Se contexto não existe, gravar contexto de boas vindas
	if (!contexto) {
		contexto = await Contexto.create({
			tipo: 'welcome',
			clienteId: cliente._id,
		});
	}

	// Se localização existir, grava a localização do cliente
	if (msg.location) {
		cliente = await Cliente.findByIdAndUpdate(
			cliente._id,
			{
				$set: {
					endereco: {
						coordinates: [
							msg.location.latitude,
							msg.location.longitude,
						],
					},
				},
			},
			{
				new: true,
			},
		);

		contexto = await Contexto.findByIdAndUpdate(
			contexto._id,
			{
				$set: {
					tipo: 'address',
					clienteId: cliente._id,
				},
			},
			{
				new: true,
			},
		);

		// Enviar mensagem pedindo o número da residência
		sendMessage(clienteTel, 'Informe o número da residência!');
	} else {
		const text = msg.body.normalize('NFD').replace('/[\u0300-\u036f]/g', '').toLowerCase();
	
		switch (text) {
			case 'cardapio':
				menuMessage(cliente, contexto);
				break;
			case 'sim':
				confirmMessage(cliente, contexto);
				break;
			case 'nao':
				denyMessage(cliente, contexto);
				break;
			case 'pedido':
				orderMessage(cliente, contexto);
				break;
			case 'cancelar':
				cancelMessage(cliente, contexto);
				break;
			case 'instrucoes':
				welcomeMessage(cliente);
				break;
			case 'finalizar':
				finishMessage(cliente, contexto);
				break;
			default:
				defaultMessage(cliente, contexto, text);
		}
	}
};

module.exports = {
	sendMessage,
};
