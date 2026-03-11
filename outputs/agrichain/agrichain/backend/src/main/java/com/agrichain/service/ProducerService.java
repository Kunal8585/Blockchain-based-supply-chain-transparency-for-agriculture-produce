package com.agrichain.service;
import com.agrichain.model.Producer;
import com.agrichain.repository.ProducerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProducerService {
    @Autowired
    private ProducerRepository producerRepository;
    public List<Producer> getAllProducers() { return producerRepository.findAll(); }
    public Optional<Producer> getProducerById(String id) { return producerRepository.findById(id); }
    public Producer createProducer(Producer producer) { return producerRepository.save(producer); }
    public Producer updateProducer(String id, Producer updated) {
        return producerRepository.findById(id).map(p -> {
            p.setName(updated.getName());
            p.setLocation(updated.getLocation());
            p.setContactNumber(updated.getContactNumber());
            p.setEmail(updated.getEmail());
            p.setLicenseNumber(updated.getLicenseNumber());
            return producerRepository.save(p);
        }).orElseThrow(() -> new RuntimeException("Producer not found: " + id));
    }
    public void deleteProducer(String id) { producerRepository.deleteById(id); }
}
