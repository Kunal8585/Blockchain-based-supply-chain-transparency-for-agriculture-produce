package com.agrichain.service;
import com.agrichain.blockchain.BlockchainService;
import com.agrichain.model.Shipment;
import com.agrichain.repository.ShipmentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ShipmentService {
    @Autowired
    private ShipmentRepository shipmentRepository;
    @Autowired
    private BlockchainService blockchainService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    public List<Shipment> getAllShipments() { return shipmentRepository.findAll(); }
    public Optional<Shipment> getShipmentById(String id) { return shipmentRepository.findById(id); }
    public List<Shipment> getShipmentsByProduct(String productId) {
        return shipmentRepository.findByProductIdOrderByTimestampAsc(productId);
    }
    public Shipment createShipment(Shipment shipment) {
        Shipment saved = shipmentRepository.save(shipment);
        try {
            String data = objectMapper.writeValueAsString(saved);
            blockchainService.addBlock(shipment.getProductId(), data);
        } catch (Exception e) {
            System.err.println("Blockchain recording failed: " + e.getMessage());
        }
        return saved;
    }
    public Shipment updateShipment(String id, Shipment updated) {
        return shipmentRepository.findById(id).map(s -> {
            s.setFromLocation(updated.getFromLocation());
            s.setToLocation(updated.getToLocation());
            s.setStage(updated.getStage());
            s.setHandledBy(updated.getHandledBy());
            s.setNotes(updated.getNotes());
            return shipmentRepository.save(s);
        }).orElseThrow(() -> new RuntimeException("Shipment not found: " + id));
    }
    public void deleteShipment(String id) { shipmentRepository.deleteById(id); }
}
