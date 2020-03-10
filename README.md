# Aplicação Demo

Esta aplicação foi criada com o intuito de demonstrar as diferenças e características entre aplicações monolíticas e as que seguem a arquitetura de microsserviços, representadas respectivamente pelas tecnologias [Node.js](https://nodejs.org/en/) e [Lagom](https://www.lagomframework.com/) em sua versão para a linguagem Scala.

## índice

- [Start em Desenvolvimento](#desenvolvimento)
- [Start em Produção](#produção)
- [FAQ / Troubleshooting](#troubleshooting)

---

## Desenvolvimento

### Pré-requisitos

Possuir instalados

- [Node.js](https://nodejs.org/en/) versão 10.0 ou superior
- [Yarn](https://classic.yarnpkg.com/en/docs/install) versão 1.22 ou superior
- [MongoDB](https://www.docker.com/) versão 4.0 ou superior
- [Python 3](https://www.python.org/downloads/) com as bibliotecas `Pandas`, `Requests` e `Pymongo` já instaladas. Você pode configurar um ambiente do [Miniconda](https://docs.conda.io/en/latest/miniconda.html), se preferir.

### Iniciando Servidor Node.js

#### Passo 1

Inicie o MongoDB na sua máquina e se certique que ele está disponível no host `localhost` e na porta `27017`, essas são as configurações padrões. Caso contrário, você deve modificar essas configurações no servidor no passo a seguir.

#### Passo 2

Popule o banco de dados com as linhas e paradas dos ônibus de São Paulo. **Este passo só precisa ser realizado uma única vez**. Estando na raiz do projeto, execute o comando (isso deve demorar um pouco):

*Linux e MacOs*:
```sh
MONGO_HOST=localhost MONGO_PORT=27017 MONGO_DB=bmap python data-seed/trip_seed.py
```

*Windows (Powershell)*:
```ps
$env:MONGO_HOST='localhost'; $env:MONGO_PORT='27017'; $env:MONGO_DB='bmap'; python data-seed/trip_seed.py
```


#### Passo 3
Entre na pasta `/nodejs-api` copie todo o conteúdo do arquivo `.env.example` para um novo arquivo `.env`. Substitua os "???" da variável `API_OLHO_VIVO_TOKEN` pelo seu token. Na seção [Produção > Iniciar serviços](#iniciar-serviços) logo abaixo é explicado como conseguí-lo.

#### Passo 4

Instale os módulos necessários. Já dentro da pasta `/nodejs-api` execute o seguinte comando:

```sh
yarn
```

#### Passo 5

Inicie a aplicação:

```sh
node index.js
```

### Iniciando Webapp

#### Passo 1

Entre na pasta `/webapp` e crie o arquivo `.env.development.local` com o seguinte conteúdo:

```.env
REACT_APP_SERVER_HOST=localhost:5000
```

#### Passo 2

Instale os módulos necessários. Já dentro da pasta `/webapp`, execute o seguinte comando:

```sh
yarn
```

#### Passo 3

Inicie o servidor como mostrado na [seção anterior](#iniciando-servidor-nodejs).

#### Passo 4

Inicie a aplicação:

```sh
yarn start
```

Assim, basta acessar http://localhost:3000.

---

## Produção
### Pré-requisitos
Possuir instalados
- [sbt](https://www.scala-sbt.org/)
- [docker](https://www.docker.com/)
- [docker-compose](https://docs.docker.com/compose/)

### Iniciar serviços

Antes de iniciar os serviços é necessário definir corretamente as variáveis de ambiente. Para isso, crie localmente um arquivo `.env` e preencha-o com o mesmo conteúdo do arquivo `.env.example` já existente substituindo cada "???" pelo seu respectivo valor esperado:

- `MONGO_DB`: Nome do banco de dados que se deseja armazenar as rotas e paradas de ônibus vindos do arquivo GTFS presente na [API SPTrans]((http://www.sptrans.com.br/desenvolvedores)).
- `API_OLHO_VIVO_TOKEN`: Após se cadastrar no [portal da API Olho Vivo](http://www.sptrans.com.br/desenvolvedores/cadastro-desenvolvedores/) de São Paulo e criar uma aplicação, você receberá esse token. [Teve algum problema com seu token?](#troubleshooting). **Saiba que a liberação deste pode demorar algumas horas após sua criação.**
- `APPLICATION_SECRET`: À nível de testes este pode ser apenas um conjunto alfanumérico Mais informações em: https://www.playframework.com/documentation/2.8.x/ApplicationSecret.

Após isso, basta subir as aplicações utilizando o [`docker-compose`](https://docs.docker.com/compose/) como segue.

#### Utilizando Node.js como servidor

```sh
docker-compose -f common-services.yml -f docker-compose-node.yml up
```

#### Utilizando Lagom como servidor

No caso da aplicação Lagom, antes de iniciar os serviços é necessário gerar a imagem do microsserviço utilizando o módulo [`sbt-native-packager`](https://www.scala-sbt.org/sbt-native-packager/formats/docker.html).

Para isso acesse o diretório do projeto e execute o comando responsável por publicar a imagem localmente:

```sh
cd lagom-api
sbt docker:publishLocal
```

Após isso, verifique se a imagem foi criada corretamente com o comando
```sh
docker images
```

O retorno deve ser algo como:
| REPOSITORY | TAG          | IMAGE ID     | CREATED           | SIZE  |
|------------|--------------|--------------|-------------------|-------|
| spbus-impl | 1.0-SNAPSHOT | d193c3623031 | About an hour ago | 597MB |
| ... | ... | ... | ... | ... |

Com a imagem publicada, basta iniciar os serviços:

```sh
docker-compose -f common-services.yml -f docker-compose-lagom.yml up
```

### Acessando a aplicação Web

Com todos os serviços no ar, basta acessar http://localhost/ no navegador.

---

## Troubleshooting

### **Entro na aplicação, porém nenhum parada é mostrada.**

Isso pode acontecer devido a algum problema nas requisições com o servidor.

1. Verifique se o servidor está no ar. 
2. Verifique se o MongoDB também está funcionando.
3. Verifique os passos logo abaixo.

### **Clico em todas as paradas, mas nenhuma tem ônibus previstos.**

Isso pode acontecer devido a algum problema nas requisições com a API Olho Vivo.

1. Verifique sua conexão com a internet.
2. Vá para o passo logo abaixo.

### **Meu token não funciona.**

Para saber se seu token está funcionando faça uma requisição HTTP POST para http://api.olhovivo.sptrans.com.br/v2.1/Login/Autenticar?token={token} substituindo `{token}` pelo seu token. Se retornado `true`, este está funcionando e `false` significa algum problema na autenticação.

**Saiba que a liberação deste pode demorar algumas horas após sua criação.**

