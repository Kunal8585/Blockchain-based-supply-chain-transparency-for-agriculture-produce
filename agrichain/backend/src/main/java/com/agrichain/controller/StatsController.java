package com.agrichain.controller;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class StatsController {

    private final MongoTemplate mongoTemplate;

    public StatsController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        
        // Fetch real counts from MongoDB collections. Gracefully handling if collection missing.
        stats.put("producers", mongoTemplate.getCollectionNames().contains("producers") ? mongoTemplate.getCollection("producers").countDocuments() : 0);
        stats.put("products", mongoTemplate.getCollectionNames().contains("products") ? mongoTemplate.getCollection("products").countDocuments() : 0);
        stats.put("shipments", mongoTemplate.getCollectionNames().contains("shipments") ? mongoTemplate.getCollection("shipments").countDocuments() : 0);
        stats.put("users", mongoTemplate.getCollectionNames().contains("users") ? mongoTemplate.getCollection("users").countDocuments() : 0);
        
        return ResponseEntity.ok(stats);
    }
}
