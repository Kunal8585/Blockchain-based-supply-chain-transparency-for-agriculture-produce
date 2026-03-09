package com.agrichain.model;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Producer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String address;
    private String contactInfo;
}