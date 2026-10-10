package com.xmid.destek_talep.config;

import com.xmid.destek_talep.entities.User;
import com.xmid.destek_talep.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("h2")
public class H2DataInitializer {

    @Bean
    CommandLineRunner initializeH2Users(UserRepository userRepository, PasswordEncoder passwordEncoder) {

        return args -> {
            createUserIfAbsent(userRepository, passwordEncoder, "user@example.com", "case_user", "User123!", "USER");
            createUserIfAbsent(userRepository, passwordEncoder, "admin@example.com", "case_admin", "Admin123!", "ADMIN");
        };
    }

    private void createUserIfAbsent(UserRepository userRepository, PasswordEncoder passwordEncoder, String email, String userName, String rawPassword, String role) {

        if (userRepository.findByEmail(email).isPresent()) {
            return;
        }

        User user = new User();
        user.setEmail(email);
        user.setUserName(userName);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setEnabled(true);

        userRepository.save(user);
    }
}
