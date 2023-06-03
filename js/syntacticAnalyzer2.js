// Percorremos cada nó para gerar a nova AST 'Abstract Syntax Tree'
const traverser = (ast, visitor) => {
  // Percorre cada nó de um array
  const traverseArray = (array, parent) =>
    array.forEach((child) => traverseNode(child, parent));

  // Percorre um nó
  const traverseNode = (node, parent) => {
    const methods = visitor[node.type];

    // Roda seu método {enter} definido no objeto na chamada do método traverser
    if (methods && methods.enter) methods.enter(node, parent);

    // Não faz mais nada caso seja um token básico
    if (basicSyntacticTokens2.includes(node.type)) return;

    // Chama a função traverseArray para os nós que possuem nós dentro
    switch (node.type) {
      case "Program":
        traverseArray(node.body, node);
        break;

      case "CodeCave":
        traverseArray(node.params, node);
        break;

      case "CodeDomain":
        traverseArray(node.params, node);
        break;

      // Erro caso encontre um token não definido
      default:
        throw new TypeError("Erro! Nó não tratável", node.type);
    }
  };

  // Início da recursão na função traverseNode
  traverseNode(ast, null);
};

/**
 * Valida a AST 'Abstract Syntax Tree' e melhora algumas estruturas
 * @param {{
 * type: "Program",
 * body: ({ type: string; value: string; } |
 *        { type: "CodeCave"; params: { type: string; value: string; }[]; name: string; value: string; } |
 *        { type: "CodeDomain"; params: { type: string; value: string; }[]; value: string; })[]
 * }} ast
 *
 * @return {{
 * type: "Program",
 * body: ({ type: string; value: string; } |
 *        { type: "Function"; expression: { arguments: { type: string; value: string; }[]; type: string; callee?: { type: 'Identifier', name: string } } } |
 *        { type: "CodeCave"; params: { type: string; value: string; }[]; name: string; value: string; } |
 *        { type: "CodeDomain"; params: { type: string; value: string; }[]; value: string; })[]
 * }} tokensStructured
 * */
const syntacticAnalysis2 = (ast) => {
  const newAst = {
    type: ast.type,
    body: [],
  };

  // Adiciona referência de ast._context para newAst.body (Alterações em um surtem efeito no outro)
  ast._context = newAst.body;

  // Estrutura básica da expressão de uma Função
  const getProgramExpression = (expression) => ({
    type: "Function",
    expression,
  });

  // Monta estrutura que define a função {enter} para cara token semântico básico
  const basicSyntacticTokensTraversers = basicSyntacticTokens2.reduce(
    (current, type) => ({
      ...current,
      [type]: {
        enter: (node, parent) => {
          parent._context.push({
            type: type,
            value: node.value,
          });
        },
      },
    }),
    {}
  );

  traverser(ast, {
    ...basicSyntacticTokensTraversers,

    // Monta estrutura que define a função {enter} para o tipo de CodeCave
    CodeCave: {
      enter: (node, parent) => {
        const expression = {
          type: "CodeCave",
          arguments: [],
        };

        if (node.name) {
          expression["callee"] = {
            type: "Identifier",
            name: node.name,
          };
        }

        node._context = expression.arguments;

        if (parent.type === "Program") {
          parent._context.push(getProgramExpression(expression));
          return;
        }

        parent._context.push(expression);
      },
    },

    // Monta estrutura que define a função {enter} para o tipo de CodeDomain
    CodeDomain: {
      enter: (node, parent) => {
        const expression = {
          type: "CodeDomain",
          arguments: [],
        };

        node._context = expression.arguments;

        if (parent.type !== "CodeDomain") {
          parent._context.push(getProgramExpression(expression));
          return;
        }

        parent._context.push(expression);
      },
    },
  });

  return newAst;
};
