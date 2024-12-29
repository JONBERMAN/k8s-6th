package com.k8s.accountbook.user;

import com.k8s.accountbook.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Boolean existsByIdentity(String identity);

    User findByIdentityAndPassword(String identity, String password);
}
