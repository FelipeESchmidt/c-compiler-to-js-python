const LETTERS = /[a-zA-Z]/;
const NUMBERS = /[0-9]/;
const NEWLINE = /\n/;
const WHITESPACE = /\s/;

const lexicalAnalysis = (input) => {
  let current = 0;
  const tokens = [];

  const addToken = (type, value, increaseCounter = true) => {
    tokens.push({
      type,
      value,
    });
    if (increaseCounter) current++;
  };

  while (current < input.length) {
    let char = input[current];

    // Compara o caractere atual com a lista de caracteres aceitos
    if (char in basicLexicalTokens) {
      addToken(basicLexicalTokens[char], char);
      continue;
    }

    if (WHITESPACE.test(char) || NEWLINE.test(char)) {
      current++;
      continue;
    }

    /* Nomes */
    // Busca encontrar nome de variáveis, comandos e tipos de variáveis
    //                 { variavel_1 }     {return}      { int }
    if (LETTERS.test(char) || char === "_") {
      let value = char;
      // É necessário cuidar com possível fim do código
      if (++current < input.length) {
        char = input[current];
        // É necessário cuidar do último caractere do código
        while (
          (LETTERS.test(char) || NUMBERS.test(char) || char === "_") &&
          current + 1 <= input.length
        ) {
          value += char;
          char = input[++current];
        }
      }

      addToken("name", value, false);

      continue;
    }

    /* Números */
    if (NUMBERS.test(char)) {
      let value = "";

      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }

      addToken("number", value, false);

      continue;
    }

    /* Strings */
    // Caso encontre um iniciador de string adiciona todos os caracteres encontrados em value até encontrar o caracter que finaliza a string
    if (char === "'" || char === '"') {
      const stringInitialChar = char;
      let value = "";
      char = input[++current];

      while (char !== stringInitialChar) {
        value += char;
        char = input[++current];
      }

      addToken("string", value, false);

      char = input[++current];
      continue;
    }

    /* Comentários */
    if (char === "/") {
      // Caso encontre o segundo '/' significa que é um comentário de uma linha
      // Então vai até encontrar o '\n' que significa o final da linha e ignora tudo
      if (input[++current] === "/") {
        while (current < input.length && !NEWLINE.test(input[current])) {
          current++;
        }
      }
      // Caso encontre em seguida o '*' significa que é um comentário de mais de uma linha
      // Então vai até encontrar a sequência de fim do comentário '*/' e ignora tudo
      else if (input[current] === "*") {
        current++;
        while (current < input.length) {
          if (input[current] === "*" && input[++current] === "/") {
            current++;
            break;
          }
          current++;
        }
      }
      // Caso seja apenas um '/' adiciona o token
      // Não é preciso o counter++ pois ele é feito "automáticamente" em input[++current] no if irmão do else
      else {
        addToken("forwardslash", char, false);
      }
      continue;
    }

    /* Caso chegue aqui quer dizer que o caractere não está na lista de aceitos */
    throw new TypeError("Erro! Caractere não conhecido: " + char);
  }
  return tokens;
};
