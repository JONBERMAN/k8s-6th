package com.k8s.accountbook.accountbook;

import com.k8s.accountbook.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;


@Entity
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "accountbook")
public class AccountBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="ab_id")
    private Long accountBookId;

    private String expense;

    private Integer money;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    private String receipt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;


}
