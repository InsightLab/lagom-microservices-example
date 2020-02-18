# Aplicação Demo

Esta aplicação foi criado com o intuito de demonstrar as diferenças e características entre aplicações monolíticas e as que seguem a arquitetura de microsserviços, representadas respectivamente pelas tecnlogias [Node.js](https://nodejs.org/en/) e [Lagom](https://www.lagomframework.com/) em sua versão para a linguagem Scala.

## Pré-requisitos
Ter instalado
- [sbt](https://www.scala-sbt.org/)
- [docker](https://www.docker.com/)
- [docker-compose](https://docs.docker.com/compose/)

## Iniciar serviços

Antes de iniciar os serviços é necessário definir corretamente as variáveis de ambiente. Para isso, crie localmente um arquivo `.env` e preencha-o com o mesmo conteúdo do arquivo `.env.example` já existente substituindo cada "???" pelo seu respectivo valor esperado:

- `MONGO_DB`: Nome do banco de dados que se deseja armazenar as rotas e paradas de ônibus vindos do arquivo GTFS presente na [API SPTrans]((http://www.sptrans.com.br/desenvolvedores)).
- `API_OLHO_VIVO_TOKEN`: Após se cadastrar no [portal da API Olho Vivo](http://www.sptrans.com.br/desenvolvedores/cadastro-desenvolvedores/) de São Paulo e criar uma aplicação, você receberá esse token.
- `APPLICATION_SECRET`: À nível de testes este pode ser apenas um conjunto alfanumérico Mais informações em: https://www.playframework.com/documentation/2.8.x/ApplicationSecret.

Após isso, basta subir as aplicações utilizando o [`docker-compose`](https://docs.docker.com/compose/) como segue.

### Utilizando Node.js como servidor

```sh
docker-compose -f common-services.yml -f docker-compose-node.yml up
```

### Utilizando Lagom como servidor

No caso da aplicação Lagom, antes de iniciar os serviços é necessário gerar a imagem do microsserviço utilizando o módulo [`sbt-native-packager`](https://www.scala-sbt.org/sbt-native-packager/formats/docker.html).

Para isso acesse o diretório do projeto e execute do comando responsável por publicar a imagem localmente:

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