const jscode = `
#include <stdio.h>
#include "teste.c"

#define NOME_TESTE "nome"
#define NUM_TESTE 10
#define NUM_TESTE2 10.8

int variableTest = 10;

struct ficha_de_aluno
{
    float nota_prova1;
    float nota_prova2;
};

void firstExample(int x, int x2){	
	
	struct ficha_de_aluno aluno1;
	
	if(x > x2){
		aluno1.nota_prova1 = 10.0;
		printf("Numero %d eh maior que %d\\n",x,x2);
	}else if(x == x2){
		aluno1.nota_prova1 = 55.0;
		printf("Numero %d eh igual a %d\\n",x,x2);
	}else if(x < x2){
		aluno1.nota_prova1 = 6.0;
		printf("Numero %d eh menor que %d\\n",x,x2);
	}

	printf("%f\\n", aluno1.nota_prova1);
	
}

void secondExample(int x){	
	
	if(x >= 60){
		printf("Aluno aprovado!");
		return;
	}
	printf("Aluno reprovado!");
	
}

_Bool thirdExampleIF(int x){
	_Bool validation = x >= 0;
	return validation;
	
}

void thirdExample(int max){
	
	int i = 0;
	int pos = 0, neg = 0, aux;
	
	for(i; i<max; i++){
		printf("Digite um numero: ");
		scanf("%d",&aux);
		if(aux >= 0){
			pos++;
		}else{
			neg++;
		}
	}
	
	printf("\\nNumeros positivos: %d",pos);
	printf("\\nNumeros negativos: %d",neg);
}

void fourthExample(int max){
	
	int i = 0;
	int pos = 0, neg = 0, aux;
	
	while(i < max){
		printf("Digite um numero: ");
		scanf("%d",&aux);
		if(aux >= 0){
			pos++;
		}else{
			neg++;
		}
		i++;
	}
	
	printf("\\nNumeros positivos: %d",pos);
	printf("\\nNumeros negativos: %d",neg);
}

void lastExample(){
	float nota1=0,nota2=0,media=0;
	int resp;

	do {
	printf("Digite a primeira nota: ");
	scanf("%f",&nota1);
	printf("Digite a segunda nota: ");
	scanf("%f",&nota2);

	media = (nota1 + nota2)/2;
	printf("Media do aluno = %f\\n",media);

	printf("Digite 1 para continuar ou 2 para sair\\n");
	scanf("%d", &resp);

	} while (resp==1);
}

void main(){
		
	int n1_ex1, n1_ex2;
	printf("Entre com um numero: ");
	scanf("%d",&n1_ex1);
	printf("Entre com outro numero: ");
	scanf("%d",&n1_ex2);
	firstExample(n1_ex1, n1_ex2);
	
	printf("\\n");

	printf("Entre com um numero de 0 a 100: ");
	scanf("%d",&n1_ex2);
	secondExample(n1_ex2);

	printf("\\n");

	printf("Entre com um numeros positivos e negativos ");	
	thirdExample(5);

	printf("\\n");

	printf("Entre com um numeros positivos e negativos ");	
	fourthExample(5);

	printf("\\n");

	lastExample();
}
`;

const pycode = `
#include <stdio.h>
#include "teste.c"

#define NOME_TESTE "nome"
#define NUM_TESTE 10
#define NUM_TESTE2 10.8

int variableTest = 10;

struct ficha_de_aluno
{
    float nota_prova1;
    float nota_prova2;
};

void firstExample(int x, int x2){	
	
	struct ficha_de_aluno aluno1;
	
	if(x > x2){
		aluno1.nota_prova1 = 10.0;
		printf("Numero %d eh maior que %d\\n",x,x2);
	}else if(x == x2){
		aluno1.nota_prova1 = 55.0;
		printf("Numero %d eh igual a %d\\n",x,x2);
	}else if(x < x2){
		aluno1.nota_prova1 = 6.0;
		printf("Numero %d eh menor que %d\\n",x,x2);
	}

	printf("%f\\n", aluno1.nota_prova1);
	
}

void secondExample(int x){	
	
	if(x >= 60){
		printf("Aluno aprovado!");
		return;
	}
	printf("Aluno reprovado!");
	
}

_Bool thirdExampleIF(int x){
	_Bool validation = x >= 0;
	return validation;
	
}

void thirdExample(int max){
	
	int i = 0;
	int pos = 0, neg = 0, aux;
	
	for(i; i<max; i++){
		printf("Digite um numero: ");
		scanf("%d",&aux);
		if(aux >= 0){
			pos++;
		}else{
			neg++;
		}
	}
	
	printf("\\nNumeros positivos: %d",pos);
	printf("\\nNumeros negativos: %d",neg);
}

void fourthExample(int max){
	
	int i = 0;
	int pos = 0, neg = 0, aux;
	
	while(i < max){
		printf("Digite um numero: ");
		scanf("%d",&aux);
		if(aux >= 0){
			pos++;
		}else{
			neg++;
		}
		i++;
	}
	
	printf("\\nNumeros positivos: %d",pos);
	printf("\\nNumeros negativos: %d",neg);
}

void lastExample(){
	float nota1=0,nota2=0,media=0;
	int resp;

	resp = 1;

	while (resp==1) {
		printf("Digite a primeira nota: ");
		scanf("%f",&nota1);
		printf("Digite a segunda nota: ");
		scanf("%f",&nota2);

		media = (nota1 + nota2)/2;
		printf("Media do aluno = %f\\n",media);

		printf("Digite 1 para continuar ou 2 para sair\\n");
		scanf("%d", &resp);
	}
}

void main(){
		
	int n1_ex1, n1_ex2;
	printf("Entre com um numero: ");
	scanf("%d",&n1_ex1);
	printf("Entre com outro numero: ");
	scanf("%d",&n1_ex2);
	firstExample(n1_ex1, n1_ex2);
	
	printf("\\n");

	printf("Entre com um numero de 0 a 100: ");
	scanf("%d",&n1_ex2);
	secondExample(n1_ex2);

	printf("\\n");

	printf("Entre com um numeros positivos e negativos ");	
	thirdExample(5);

	printf("\\n");

	printf("Entre com um numeros positivos e negativos ");	
	fourthExample(5);

	printf("\\n");

	lastExample();
}
`;
