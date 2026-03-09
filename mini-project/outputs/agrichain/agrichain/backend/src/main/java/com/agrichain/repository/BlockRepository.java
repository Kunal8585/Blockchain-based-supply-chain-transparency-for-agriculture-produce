package com.agrichain.repository;
import com.agrichain.model.Block;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface BlockRepository extends MongoRepository<Block, String> {
    List<Block> findByProductIdOrderByIndexAsc(String productId);
    Optional<Block> findTopByOrderByIndexDesc();
}
