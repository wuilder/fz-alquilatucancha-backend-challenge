## Intro


### Correr el proyecto

Clonar el repositorio e instalar las dependencias con

```bash
$ yarn
```
1. Crear y correr el contenedor con Redis.
    - Descargar la imagen: `docker pull redis:latest`

    - Levantar la imagen: `docker run -d --name Redis -p 6379:6379 redis:latest`

    - Chequear que este funcionando: `docker ps`

2. Levantar la api: `npm run start:dev`

3. Levantar el mock: `node server.js`

4. Una vez que esten corriendo las 3 cosas hacer un: `curl "localhost:3000/search?placeId=ChIJW9fXNZNTtpURV6VYAumGQOw&date=2022-08-25`


### Decisiones

1. Se decidió utilizar Redis por sobre una caché en la memoria de la aplicación debido a que, si la carga es muy alta, evitaríamos colapsar la memoria de la app. Me basé parte de la implementación de la siguiente documentación: `https://medium.com/@islam.farid16/seamless-integration-of-redis-with-nestjs-a-comprehensive-guide-1bbf0f79c926.`

2. Se creó la interfaz RedisRepository:

    - Ubicada en src/domain/repository/redis.repository.ts, define los métodos necesarios:

    - `set(key: string, value: string, ttl?: number): Promise<void>`

    - `get(key: string): Promise<string | null>`

    - `delete(key: string): Promise<void>`

3. Implementación del Servicio Redis:

    - RedisService implementa RedisRepository.

    - Utiliza el cliente oficial de Redis para Node.js.

    - Maneja conexiones y errores de Redis.

4. Configuración del Módulo Redis:

    - RedisModule registra el token REDIS como un proveedor asociado a RedisService.

    - Exporta el token para su uso en otros módulos.

5. Registro en el AppModule:

    - Se importó RedisModule en AppModule para hacerlo disponible globalmente.

6. Inyección del Proveedor Redis:

    - En cualquier servicio, se utiliza @Inject('REDIS') para acceder a las operaciones de Redis.

7. Se implementó el manejador de eventos para: `booking_created`, `booking_cancelled`, `club_updated`, `court_updated`

8. Se implementó Cache Service para que actúe como una capa de abstracción, evitando que los controladores o casos de uso interactúen directamente con Redis.

9. src/
    - domain
        - repository
            - redis.respository.ts - **Contrato (interfaz) del dominio**
    - infrastructure
        - events
            - handlers
                - slot-booked-event.handler.ts - **Manejador para el evento SlotBookedEvent**
                - slot-available-event.handler.ts - **Manejador para el evento SlotAvailableEvent**
                - club-updated-event.handler.ts - **Manejador para el evento ClubUpdatedEvent**
                - court-updated-event.handler.ts - **Manejador para el evento CourtUpdatedEvent**
            - events.module.ts - **Módulo que agrupa todos los manejadores de eventos y los registra en el sistema CQRS**
        - redis
            - redis.module.ts - **Registro de Redis como proveedor**
            - redis.service.ts  - **Implementación de Redis**
    - application
        - application.module.ts - **Módulo de la capa de aplicación**
        - cache.service.ts - **Servicio que usa RedisRepository**




### Notas

El docker-compose levanta **Redis**, **Mock** y la **Api** pero cuando el **Mock** quiere pegarle a la **Api** tira error de conexión.

Hice login al contenedor de la **Api**, para corroborar que el puerto estuviera abierto y respondiendo con `netstat -tuln | grep 3000`, he chequeado con `docker inspect` para ver que Networks, Port, IPAddress esten en el rango de los servicios.

Tambien se corroboro con `docker logs` para chequear que la **Api** estuviera funcionando.