const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, LegacySessionAuth } = require('whatsapp-web.js');
const Restaurante = require('./src/models/restaurante.model');
const Cliente = require('./src/models/cliente.model');
const Contexto = require('./src/models/contexto.model');

// Path where the session data will be stored
const SESSION_PATH = process.env.SESSION_PATH;

// Load the session data if it has been previously saved
let sessionConfig;
if (fs.existsSync(SESSION_PATH)) {
    sessionConfig = require(SESSION_PATH);
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
	fs.writeFile(SESSION_PATH, JSON.stringify(session), err => {
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
	fs.writeFile(SESSION_PATH, JSON.stringify(session), err => {
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

const sendMessage = async (phone, message) => {
	const phone = `55${phone}@c.us`;
	const message = message || 'Algo deu errado com a mensagem';

	try {
		// await client.sendMessage(phone, message);
	} catch(err) {
		console.log(err);
	}
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
			case 'sim':
				sendMessage(clienteTel, text);
				break;
			case 'nao':
				sendMessage(clienteTel, text);
				break;
			case 'pedido':
				sendMessage(clienteTel, text);
				break;
			case 'cancelar':
				sendMessage(clienteTel, text);
				break;
			case 'instrucoes':
				sendMessage(clienteTel, text);
				break;
			default:
				console.log('default');
		}
	}
};
