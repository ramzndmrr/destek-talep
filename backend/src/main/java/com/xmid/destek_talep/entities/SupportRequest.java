package com.xmid.destek_talep.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "destek_talepleri")
@Getter
@Setter
@NoArgsConstructor
public class SupportRequest extends BaseEntity{
}
