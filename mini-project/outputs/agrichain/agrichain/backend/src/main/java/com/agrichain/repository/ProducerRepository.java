package com.agrichain.repository;
import com.agrichain.model.Producer;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface ProducerRepository extends MongoRepository<Producer, String> {
    Optional<Producer> findByEmail(String email);
    Optional<Producer> findByLicenseNumber(String licenseNumber);
}
