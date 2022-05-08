package co.com.sofka.crud_be.repository;

import co.com.sofka.crud_be.model.Todo;
import org.springframework.data.repository.CrudRepository;

public interface TodoRepository extends CrudRepository<Todo, Long> {
}
