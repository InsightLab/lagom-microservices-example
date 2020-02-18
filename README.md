# lagom-microservices-example

## Iniciar serviços

### Utilizando Node.js como servidor

```sh
docker-compose -f common-services.yml -f docker-compose-node.yml up
```

### Utilizando Lagom como servidor

```sh
docker-compose -f common-services.yml -f docker-compose-lagom.yml up
```