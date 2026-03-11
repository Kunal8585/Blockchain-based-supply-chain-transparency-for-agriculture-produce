package com.agrichain.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "blocks")
public class Block {
    @Id
    private String id;

    private String productId;
    private long index;

    private String hash;
    private String previousHash;
    private String data;
    private Instant timestamp;

    public Block() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public long getIndex() { return index; }
    public void setIndex(long index) { this.index = index; }
    public String getHash() { return hash; }
    public void setHash(String hash) { this.hash = hash; }
    public String getPreviousHash() { return previousHash; }
    public void setPreviousHash(String previousHash) { this.previousHash = previousHash; }
    public String getData() { return data; }
    public void setData(String data) { this.data = data; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}