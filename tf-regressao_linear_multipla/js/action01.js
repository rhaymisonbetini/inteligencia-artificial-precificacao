$("#result").text('');

let arrX = [];
let arrY = [];
let arrInput = [];


function exibir(str = '') {
	$('#result').text(str)
}

function abrir(event) {
	let file = event.target.value;
	file = file.replace(/\\/g, '-');
	let arr = file.split('-');
	carregar(arr[arr.length - 1]);
}

function carregar(str = '') {
	$.ajax({
		url: str,
		dataType: 'text',
		success: function (data) {
			let caractere = ',';
			if (data.indexOf(';') >= 0) {
				caractere = ';'
			}

			let arrLinha = data.split('\r\n');

			let titulos = arrLinha[0].split(caractere);

			let qtdEntradas = titulos.filter(function (x) { return x == 'input'; }).length;


			let X = [];
			let Y = [];

			for (let i = 1; i < arrLinha.length; i++) {
				let celulasX = [];
				let celulasY = [];
				let arrCelula = arrLinha[i].split(caractere);

				for (let j = 0; j < arrCelula.length; j++) {

					if (arrCelula[j].toString().trim().length > 0) {
						if (j < qtdEntradas) {
							celulasX.push(parseFloat(arrCelula[j]))
						} else {
							celulasY.push(parseFloat(arrCelula[j]))
						}
					}

				}

				if (celulasX.length > 0) {
					X.push(celulasX);
				}

				if (celulasY.length > 0) {
					Y.push(celulasY);
				}

			}

			let difference = X.length - Y.length;
			let inputs = X.slice(X.length - difference, X.length);

			X.splice(X.length - difference, difference);
			
			arrX = X;
			arrY = Y;
			arrInput = inputs;

			exibir('dados carregados com sucesso.');

		}
	})
}

function executar() {
	exibir('...processando');

	let txt = '';
	let units = Number(arrY[0].length);
	let inputShape = Number(arrX[0].length);
	let linesX = Number(arrX.length);
	let linesInput = Number(arrInput.length);

	//iniciando modelo sequencial para pilhas de camadas
	const model = tf.sequential();

	//passando o shape 2 e informando que seram 1 unidade
	const inputLayer = tf.layers.dense({ units: units, inputShape: [inputShape] });
	model.add(inputLayer);

	//Compilando rede neural com erro quadratico médio em sgd o dobro o valor de inputs
	model.compile({ loss: 'meanSquaredError', optimizer: tf.train.sgd(0.05) })

	//arrayx colunas [ 0:[1,2 ], 1:[2,3 ] , 2:[ 3,4 ]] -> uma matriz de 3 linhas por 2 colunas
	const x = tf.tensor(arrX, [linesX, inputShape]);

	//array são os resultados esperados para cada linha e coluna da matrix
	//  [ 0:[1,2 ], 1:[2,3 ] , 2:[ 3,4 ]]  => [0:[30], 1:[50], 2:[70]]
	const y = tf.tensor(arrY);

	//criacao do tensor sem resultados em x em uma matrix 2x2
	const input = tf.tensor(arrInput, [linesInput, inputShape]);

	//treinando x => y em 500 epocas
	model.fit(x, y, { epochs: 500 }).then(() => {

		let output = model.predict(input).dataSync();
		output = convertArray(output);
		let z = tf.tensor(output);

		txt += 'Regressão linear Multipla com rede neural: \n';
		txt += 'TREINAMENTO: \n';
		txt += 'ENTRADA:' + x.toString() + '\n\n' + 'SAIDA: ' + y.toString() +'\n\n';

		txt += 'ENTRADAS SEM SAIDA: \n';
		txt += input.toString() + '\n';
		txt += 'RESPOSTA REDE NEURAL: \n';
		txt += z.toString() + '\n';
		exibir(txt);
	})

}

function convertArray(array) {

	let result = [];
	for (let i = 0; i < array.length; i++) {
		result.push(Math.ceil(array[i]).toFixed(0));
	}

	return result;

}