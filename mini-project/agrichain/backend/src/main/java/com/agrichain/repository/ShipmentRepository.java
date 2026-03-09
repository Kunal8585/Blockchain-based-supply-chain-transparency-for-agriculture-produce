package com.agrichain.repository;
import com.agrichain.model.Shipment;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ShipmentRepository extends MongoRepository<Shipment, String> {
    List<Shipment> findByProductIdOrderByTimestampAsc(String productId);
    List<Shipment> findByStage(String stage);
}

