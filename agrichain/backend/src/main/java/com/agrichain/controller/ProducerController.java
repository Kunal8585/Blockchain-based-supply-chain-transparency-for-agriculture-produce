package com.agrichain.controller;

import com.agrichain.model.Producer;
import com.agrichain.service.ProducerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/producers")
@CrossOrigin(origins = "*")
public class ProducerController {

    @Autowired
    private ProducerService producerService;

    @GetMapping
    public List<Producer> getAllProducers() {
        return producerService.getAllProducers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producer> getProducerById(@PathVariable String id) {
        return producerService.getProducerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Producer createProducer(@RequestBody Producer producer) {
        return producerService.createProducer(producer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producer> updateProducer(@PathVariable String id, @RequestBody Producer updated) {
        try {
            return ResponseEntity.ok(producerService.updateProducer(id, updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProducer(@PathVariable String id) {
        producerService.deleteProducer(id);
        return ResponseEntity.noContent().build();
    }
}
