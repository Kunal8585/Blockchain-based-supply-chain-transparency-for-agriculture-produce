package com.agrichain.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "products")
public class Product {
    @Id
    private String id;
    private String name;

    private String category;
    private double quantity;
    private String unit;
    private LocalDate harvestDate;

    private String status; // e.g. HARVESTED, IN_TRANSIT, DELIVERED

    private String batchNumber;
    private String producerId;

    public Product() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public double getQuantity() { return quantity; }
    public void setQuantity(double quantity) { this.quantity = quantity; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public LocalDate getHarvestDate() { return harvestDate; }
    public void setHarvestDate(LocalDate harvestDate) { this.harvestDate = harvestDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }
    public String getProducerId() { return producerId; }
    public void setProducerId(String producerId) { this.producerId = producerId; }
}