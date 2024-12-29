package com.k8s.accountbook.accountbook;

import com.k8s.accountbook.accountbook.AccountBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountBookRepository extends JpaRepository<AccountBook, Long> {
    List<AccountBook> findAllByUserId(Long userId);

}
