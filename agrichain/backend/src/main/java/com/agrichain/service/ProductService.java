package com.agrichain.service;
import com.agrichain.model.Product;
import com.agrichain.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;
    public List<Product> getAllProducts() { return productRepository.findAll(); }
    public Optional<Product> getProductById(String id) { return productRepository.findById(id); }
    public Optional<Product> getProductByBatch(String batchNumber) { return productRepository.findByBatchNumber(batchNumber); }
    public List<Product> getProductsByProducer(String producerId) { return productRepository.findByProducerId(producerId); }
    public Product createProduct(Product product) {
        if (product.getStatus() == null) product.setStatus("HARVESTED");
        return productRepository.save(product);
    }
    public Product updateProduct(String id, Product updated) {
        return productRepository.findById(id).map(p -> {
            p.setName(updated.getName());
            p.setCategory(updated.getCategory());
            p.setQuantity(updated.getQuantity());
            p.setUnit(updated.getUnit());
            p.setHarvestDate(updated.getHarvestDate());
            p.setStatus(updated.getStatus());
            return productRepository.save(p);
        }).orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }
    public void deleteProduct(String id) { productRepository.deleteById(id); }
}

