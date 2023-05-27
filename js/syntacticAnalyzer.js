/**
 * Análisa os tokens e monta as estruturas
 * @param {{type: String, value: String}[]} tokens
 * */
const syntacticAnalysis = (tokens) => {
  let current = 0;

  // Caminha pelo código fonte buscando e encontrando sequências de tokens
  const walk = () => {
    let token = tokens[current];

    // Caso encontre um token complexo, entra em recursão até encontrar seu finalizador
    if (token.type in complexSyntaticTokens) {
      const { finisher, type, nameGetter } = complexSyntaticTokens[token.type];

      token = tokens[++current];

      let name = undefined;
      if (nameGetter) {
        let prevToken = tokens[current - 2];
        name =
          prevToken && prevToken.type === "name" ? prevToken.value : undefined;
      }

      let node = {
        type: type,
        params: [],
        name,
      };

      while (token.value !== finisher) {
        node.params.push(walk());
        token = tokens[current];
      }
      current++;
      return node;
    }

    // Caso encontre um '\' valida as suas possibilidades
    if (token.type === "backslash") {
      const { type, value } = tokens[++current];
      let currentTypeAndNext;
      if (type === "name") currentTypeAndNext = token.type + "_" + value;
      else currentTypeAndNext = token.type + "_" + type;

      token = { type, value };
      if (currentTypeAndNext in backslashSyntaticTokens) {
        return backslashSyntaticTokens[currentTypeAndNext];
      }
    }

    // Caso encontre token básico apenas troca o seu nome
    if (token.type in basicSyntaticTokens) {
      current++;
      return { ...basicSyntaticTokens[token.type], value: token.value };
    }

    // Validação por token duplo (==, ||), current não pode ser o último index
    // Valida tokens duplos e agrupa-os com o nome correto
    if (current < tokens.length) {
      const { type } = tokens[current + 1];
      const currentTypeAndNext = token.type + "_" + type;
      if (currentTypeAndNext in doubleSyntaticTokens) {
        current += 2;
        return doubleSyntaticTokens[currentTypeAndNext];
      }
    }

    // Caso não seja um token duplo então busca pelo token normal (=, |)
    if (token.type in doubleSyntaticTokens) {
      current++;
      return doubleSyntaticTokens[token.type];
    }

    // Caso encontre um token que não é tratável
    throw new TypeError("Erro! Token não tratável", token.type);
  };

  const programTokens = {
    type: "Program",
    body: [],
  };

  while (current < tokens.length) {
    programTokens.body.push(walk());
  }

  return programTokens;
};
