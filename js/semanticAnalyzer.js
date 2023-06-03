/**
 * Valida as estruturas da AST 'Abstract Syntax Tree' e gera uma AST ainda mais completa
 * @param {{
 * type: "Program",
 * body: ({ type: string; value: string; } |
 *        { type: "Function"; expression: { arguments: { type: string; value: string; }[]; type: string; callee?: { type: 'Identifier', name: string } } } |
 *        { type: "CodeCave"; params: { type: string; value: string; }[]; name: string; value: string; } |
 *        { type: "CodeDomain"; params: { type: string; value: string; }[]; value: string; })[]
 * }} ast
 * */
const processor = (ast) => {
  // Iniciamos buscando os Statements globais como variáveis globais, structs, includes
  const globalStatements = findGlobalStatements(ast.body);

  // Aqui tentamos pré-processar as declarações globais para reordenar e melhorar sua estrutura de macro
  const globalStatementsProcessed = processGlobalStatements(globalStatements);

  const globalItem = {
    type: "GlobalStatements",
    body: globalStatementsProcessed,
  };

};

/**
 * Busca retornar coisas globais como variáveis globais, structs, includes
 * @param {({ type: string; value: string; } |
 *        { type: "CodeCave"; params: { type: string; value: string; }[]; name: string; value: string; } |
 *        { type: "CodeDomain"; params: { type: string; value: string; }[]; value: string; })[]} astBody
 * */
const findGlobalStatements = (astBody) => {
  const astBodyClone = [...astBody];

  // Percorremos o corpo até encontrar um ; ou um # como primeiro caractere
  let current = 0;
  const globalStatements = [];

  while (current < astBodyClone.length) {
    // Buscando por linhas que começam com #
    if (astBodyClone[0].type === "Macro") {
      if (astBodyClone[1].value === "include") {
        let cutIndex;
        // Encontrou um '#include "arquivo.file"
        if (astBodyClone[2].type === "StringLiteral") cutIndex = 3;
        // Encontrou um '#include <arquivo.h>
        else {
          const greaterIndex = astBodyClone.findIndex(
            (item) => item.type === "Greater"
          );
          cutIndex = greaterIndex + 1;
        }

        globalStatements.push({
          type: "Macro",
          value: astBodyClone.splice(0, cutIndex),
        });
        current = 0;
      }

      // Encontrou definição de variável
      if (astBodyClone[1].value === "define") {
        let cutIndex = 4;

        if (astBodyClone[4].type === "Dot") cutIndex += 2;

        globalStatements.push({
          type: "Define",
          value: astBodyClone.splice(0, cutIndex),
        });
        current = 0;
      }
    }

    // Caso encontre um ;
    if (astBodyClone[current].type === "Terminator") {
      const statement = [];

      for (let i = 0; i < current + 1; i++) {
        // Caso encontre uma definição de uma struct
        if (astBodyClone[i].value === "struct") {
          // Processa o corpo da struct como se fosse uma sequencia
          const instruct = processBody(
            astBodyClone[i + 2].expression.arguments
          );

          globalStatements.push({
            type: "Struct",
            name: astBodyClone[i + 1].value,
            body: instruct,
          });
          i += 4;
        } else {
          statement.push(astBodyClone[i]);
        }
      }

      // Remove todos itens que foram percorridos
      astBodyClone.splice(0, current + 1);

      // Adiciona o Statement encontrado
      if (statement.length !== 0) {
        globalStatements.push({
          type: "Statement",
          value: statement,
        });
      }
      current = 0;
    }
    current++;
  }

  return globalStatements;
};

/**
 * Melhora as estruturas de #include e #define
 * @param {{type: string; value: {type: string; value: string}[]}[]} globalStatements
 * @returns
 */
const processGlobalStatements = (globalStatements) => {
  /**
   * Melhora estrutura do #include adicionando o nome do arquivo
   * @param {{type: string; value: {type: string; value: string}[]}} globalStatement
   * @returns
   */
  const betterIncludeStatement = (globalStatement) => {
    const macroValue = globalStatement.value;
    // Começa no item 3 e remove o '<' e o '>'
    const fileName = macroValue
      .slice(2, macroValue.length)
      .filter(({ type }) => type !== "Less" && type !== "Greater")
      .map(({ value }) => value)
      .join("");

    return {
      type: globalStatement.type,
      subtype: "include",
      file: fileName,
    };
  };

  /**
   * Melhora estrutura do #define adicionando o nome da constante e seu valor
   * @param {{type: string; value: {type: string; value: string}[]}} globalStatement
   * @returns
   */
  const betterDefineStatement = (globalStatement) => {
    const macroValue = globalStatement.value;
    // Busca o nome da constante, o tipo e o valor
    const constantName = macroValue[2].value;
    const constantType = macroValue[3].type;
    const constantValue = macroValue
      .slice(3, macroValue.length)
      .map(({ value }) => value)
      .join("");

    return {
      type: globalStatement.type,
      subtype: "constant",
      variable: constantName,
      variableValue: constantValue,
      variableType: constantType,
    };
  };

  const betterers = {
    Macro: betterIncludeStatement,
    Define: betterDefineStatement,
  };

  return globalStatements.map((globalStatement) =>
    betterers[globalStatement.type]
      ? betterers[globalStatement.type](globalStatement)
      : globalStatement
  );
};
