/**
 * Análisa os tokens e monta as estruturas
 * @param {{type: String, value: String}[]} tokens
 * */
const parser = (tokens) => {
  let current = 0;

  // Inside it, we define another function called walk() which enables use to do some recursive acrobatics
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

    if (token.type in basicSyntaticTokens) {
      current++;
      return { ...basicSyntaticTokens[token.type], value: token.value };
    }

    if (current < tokens.length) {
      const { type } = tokens[current + 1];
      const currentTypeAndNext = token.type + "_" + type;
      if (currentTypeAndNext in doubleSyntaticTokens) {
        current += 2;
        return doubleSyntaticTokens[currentTypeAndNext];
      }
    }

    if (token.type in doubleSyntaticTokens) {
      current++;
      return doubleSyntaticTokens[token.type];
    }

    //if we don't recognize the token, we throw an error.
    throw new TypeError(token.type);
  };

  // we declare this variable named AST, and start our walk() function to parse our tokens.
  const programTokens = {
    type: "Program",
    body: [],
  };

  while (current < tokens.length) {
    programTokens.body.push(walk());
  }

  return programTokens;
};
