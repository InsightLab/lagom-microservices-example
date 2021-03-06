# Aplicação Demo

Esta aplicação foi criada com o intuito de demonstrar as diferenças e características entre aplicações monolíticas e as que seguem a arquitetura de microsserviços, representadas respectivamente pelas tecnologias [Node.js](https://nodejs.org/en/) e [Lagom](https://www.lagomframework.com/) em sua versão para a linguagem Scala.

## índice

- [Start em Desenvolvimento](#desenvolvimento)
- [Start em Produção](#produção)
- [Start usando Kubernetes](#kubernetes)
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


### Iniciando Servidor Scala com Lagom

#### Seguir passos 1, 2 e 3 da seção anterior
#### Passo 4

Realize as configurações necessários com o **sbt**. Já dentro da pasta `/lagom-api` execute o seguinte comando:

```sh
sbt
```

#### Passo 5

Já dentro do **sbt shell**, inicie a aplicação:

```sh
sbt:spbus> runAll
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

# Kubernetes

### Pré-requisitos

Possuir instalados

- [docker](https://www.docker.com/)
- [minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/) 

É possivel que na utilização de outras ferramentas similares ao minikube, alguns dos passos descritos abaixo tenham um funcionamento inadequado.

Partimos do princípio de que quem estiver lendo esse README, tem alguns conhecimentos de conceitos básicos do Kubernetes, como Namespace, Services, Deployments, Pods, ConfigMaps, entre outros.


### Comandos iniciais

Para dar início aos passos abaixo o minikube deve estar instalado e executando.

É necessário criar o namespace `microservices-example` e configurá-lo como namespace padrão. Para isso, basta executar os dois comandos abaixo:

```
$ kubectl create namespace microservices-example
$ kubectl config set-context --current --namespace=microservices-example
```
### Criação do ConfigMap
No contexto desse projeto, ConfigMap é usado para armazenar variáveis que serão usadas pelos microsserviços. Para criá-lo, é necessário seguir o passo de criação do arquivo `.env`, seguindo o padrão no arquivo `.env-example`. Segue o exemplo abaixo:

Arquivo: `.env`

```
MONGO_DB=bmap
API_OLHO_VIVO_TOKEN=???
APPLICATION_SECRET=???
MONGO_HOST=mongo
PORT=9000
```

Você deve alterar as variáveis com `???` seguindo as informações abaixo:

- `API_OLHO_VIVO_TOKEN`: Após se cadastrar no [portal da API Olho Vivo](http://www.sptrans.com.br/desenvolvedores/cadastro-desenvolvedores/) de São Paulo e criar uma aplicação, você receberá esse token. [Teve algum problema com seu token?](#troubleshooting). **Saiba que a liberação deste pode demorar algumas horas após sua criação.**
- `APPLICATION_SECRET`: À nível de testes este pode ser apenas um conjunto alfanumérico Mais informações em: https://www.playframework.com/documentation/2.8.x/ApplicationSecret.

Por fim, devemos criar o ConfigMap nomeado de `env`, com o seguinte comando (necessário que os passos acima tenham sido executados corretamente):

```
$ cd lagom-microservices-example/
$ kubectl create cm env --from-env-file .env

# Para visualizar o ConfigMap recém criado, use o comando a seguir
$ kubectl get env
```

O retorno deve ser algo como:
| NAME | DATA  | AGE |
|------|-------|-----|
| env  |  6    | 10d |



### Build das imagens do docker

A ferramenta `minikube` possui um docker "embutido". No processo de geração de Services e Deployments, é nesse ambiente docker embutido que se localizam as imagens que o kubernetes usará. Portanto, como temos imagens (Dockerfiles) customizadas, é recomendável que criemos nossas próprias imagens. Para isso, devemos usar os seguintes comandos:


```
$ eval $(minikube docker-env)
$ docker build -t mongo-local k8s/mongo/
$ docker build -t microservices-example-node:prod nodejs-api/
```

`Para gerar a imagem da api em node.js:`
```
$ docker build -t microservices-example-node:prod nodejs-api/
```

`Para gerar a imagem da api em lagom (observação - ver seção para utilizar o lagom como api):` 
```
$ sbt docker:publishLocal
```

Para o `webapp` é um pouco diferente. É possível que ao efetuar o build da imagem do webapp, o docker tenha algum problema com memória. Uma solução paleativa encontrada é a de instalar as dependências e gerar os arquivos da pasta `build` do webapp fora do comando docker. Para isso você deve alterar dois arquivos localizados na pasta `/webapp`: `.dockerignore` e `Dockerfile`.

`.dockerignore` na linha `10`, comentar o parâmetro `/build`:

`original`
```
6       .
7       .
8       .
9  # production
10  /build
11      .
12      .
13      .
```

`comentado`
```
6       .
7       .
8       .
9  # production
10 # /build
11      .
12      .
13      .
```

`Dockerfile` também na linha `10`, comentar o parâmetro `RUN yarn build`

`original`
```
6       .
7       .
8       .
9  RUN yarn
10 RUN yarn build
11      .
12      .
13      .
```

`comentado`
```
6       .
7       .
8       .
9  RUN yarn
10 # RUN yarn build
11      .
12      .
13      .
```

Por fim, siga os seguintes passos:

```
$ cd webapp
$ yarn
$ yarn build
$ docker build -t webapp .
```

Para visualizar as imagens geradas use o comando `$ docker images`. Você deverá ver no mínimo 4 imagens:
- `webapp`
- `mongo-local`
- `microservices-example-node` (Caso tenha usado a imagem da api em node)
- `spbus-impl` (Caso tenha usado a imagem da api em lagom)

### NGINX-Ingress
[Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) faz parte da API do Kubernetes e responsável por gerenciar os serviços de um cluster, provendo Balanceamento de carga, SSL e hospedagem baseada em nomes virtuais.

Ele deve ser composto por duas partes: Ingress Resource - `ingress.yaml` e Ingress Controller - `nginx-ingress-controller`. O primeiro mapeia as rotas e os nomes virtuais, o segundo gerencia o acesso através de um nignx "embutido".

Para habilitarmos o `nginx-ingress-controller`, devemos usar o comando abaixo:
```
$ minikube addons enable ingress

# A saída deve ser semelhante à mensagem abaixo. 
The 'ingress' addon is enabled

```

Para visualizar se o nginx-ingress-controller está executando, use o comando:
```
$ kubectl get po -n kube-system
```

A saída deverá ser semelhante à tabela abaixo:
|                   NAME                      | READY |  STATUS     |  RESTARTS |  AGE |
|---------------------------------------------|-------|-------------|-----------|------|
| nginx-ingress-controller-6fc5bcc8c9-pgtx2   | 1/1   |  Running    |     0     |  12s |


A aplicação do `ingress.yaml` é feita na seção abaixo com um comando mais genérico de aplicação dos Services e Deployments.

### Criação de Services, Deployments e Ingress do Kubernetes

Agora que já geramos as imagens do docker, devemos criar os Services e Deployments para que possamos acessar nossa aplicação. Antes disso, uma breve explicação da estrutura de diretórios. Temos os seguintes diretórios na pasta `k8s`:
- `common` (Arquivos .yaml contendo as configurações do webapp e mongo)
- `node` (Arquivos .yaml contendo as configurações do ingress para a api node)
- `lagom` (Arquivos .yaml contendo as configurações do ingress para a api lagom)
- `mongo` (Arquivso gerais para criação da imagem do mongo e para inserção dos dados relacionados à paradas e rotas)

Para subir as aplicações, use os seguintes comandos:

#### Serviços comuns (Mongo e webapp)

```
$ kubectl apply -f k8s/common
```


#### Usando a api em node
```
$ kubectl apply -f k8s/node
```


#### Usando a api em lagom

```
$ kubectl apply -f k8s/lagom
```



Em seguida, verifique se os pod's estão rodando corretamente com o seguinte comando:

```
$ kubcetl get po
```
A saída deverá ser a seguinte:
|          NAME               | READY |  STATUS     |  RESTARTS |  AGE |
|-----------------------------|-------|-------------|-----------|------|
| mongo-65cff8f96-j99z8       | 1/1   |  Running    |     0     |  42s |
| api-server-6fc6d4d46d-gxqw8 | 1/1   |  Running    |     0     |  42s |
| webapp-66d6d57967-9tr7c     | 1/1   |  Running    |     0     |  42s |


Para verificar se o Ingress resource foi aplicado, pode-se usar o comando abaixo:

```
$ kubectl get ing 
```

|          NAME           | HOSTS |      ADDRESS      |   PORTS |  AGE |
|-------------------------|-------|-------------------|---------|------|
|          ing            |   *   |    192.168.99.102 |  80     |  30s |


Para que não ocorra conflitos entre os ingress é aconselhável rodar somente um por vez (node ou lagom). Perceba que nos diretórios do node e lagom, existem arquivos do ingress que configuram as rotas e o servidor para cada uma das api's.
