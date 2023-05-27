/**
 * Análisa os tokens e monta as estruturas
 * @param {{type: String, value: String}[]} tokens
 * */
const parser = (tokens) => {
  let current = 0;

  // Inside it, we define another function called walk() which enables use to do some recursive acrobatics
  const walk = () => {
    let token = tokens[current];

    /* here we perform some recursive acrobatics. If we encounter an opening bracket, we create a
      new node, call our walk fuction again and push whatever there is inside the bracket,
      inside a child node. When we reach the closing bracket, we stop and push the child node,
      in its parent node */
    if (token.type === "bracket" && token.value === "[") {
      token = tokens[++current];

      let node = {
        type: "Arr",
        params: [],
      };

      while (
        token.type !== "bracket" ||
        (token.type === "bracket" && token.value !== "]")
      ) {
        node.params.push(walk());
        token = tokens[current];
      }
      current++;
      return node;
    }

    // same story here. This time we call it a 'CodeDomain'.
    if (token.type === "curly" && token.value === "{") {
      token = tokens[++current];

      let node = {
        type: "CodeDomain",
        params: [],
      };

      while (
        token.type !== "curly" ||
        (token.type === "curly" && token.value !== "}")
      ) {
        node.params.push(walk());
        token = tokens[current];
      }
      current++;
      return node;
    }

    // same as brackets and curly braces but for paranthesis, we call it 'CodeCave'
    if (token.type === "paren" && token.value === "(") {
      token = tokens[++current];
      let prevToken = tokens[current - 2];
      if (typeof prevToken != "undefined" && prevToken.type === "name") {
        var node = {
          type: "CodeCave",
          name: prevToken.value,
          params: [],
        };
      } else {
        var node = {
          type: "CodeCave",
          params: [],
        };
      }

      while (
        token.type !== "paren" ||
        (token.type === "paren" && token.value !== ")")
      ) {
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
