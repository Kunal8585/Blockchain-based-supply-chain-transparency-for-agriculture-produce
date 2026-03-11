package com.agrichain.repository;
import com.agrichain.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByProducerId(String producerId);
    Optional<Product> findByBatchNumber(String batchNumber);
    List<Product> findByStatus(String status);
}

