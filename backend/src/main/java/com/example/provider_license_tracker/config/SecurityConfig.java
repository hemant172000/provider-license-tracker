package com.example.provider_license_tracker.config;

import com.example.provider_license_tracker.security.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> {})
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // ── PUBLIC ──
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()

                        // ── FILES ──
                        .requestMatchers(HttpMethod.GET, "/files/download/**").hasAnyRole("ADMIN", "PROVIDER", "TEAM_MEMBER", "TEAM_LEADER", "GROUP_MGR")
                        .requestMatchers(HttpMethod.GET, "/files/**").hasAnyRole("ADMIN", "PROVIDER", "TEAM_MEMBER", "TEAM_LEADER", "GROUP_MGR")
                        .requestMatchers(HttpMethod.POST, "/files/upload").hasAnyRole("ADMIN", "TEAM_MEMBER", "TEAM_LEADER", "GROUP_MGR")
                        .requestMatchers(HttpMethod.DELETE, "/files/**").hasAnyRole("ADMIN", "TEAM_MEMBER", "TEAM_LEADER", "GROUP_MGR")

                        // ── ADMIN ──
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/admin/assign-provider").hasAnyRole("ADMIN", "TEAM_LEADER")

                        // ── PROVIDERS ──
                        .requestMatchers(HttpMethod.GET, "/providers/all").hasAnyRole("ADMIN", "TEAM_LEADER")
                        .requestMatchers(HttpMethod.GET, "/providers").hasAnyRole("ADMIN", "TEAM_LEADER")
                        .requestMatchers(HttpMethod.POST, "/providers/create").hasAnyRole("ADMIN", "TEAM_LEADER")
                        .requestMatchers("/providers/my-profile").hasRole("PROVIDER")
                        .requestMatchers("/providers/my-files").hasRole("PROVIDER")
                        .requestMatchers("/providers/upload-my-file").hasRole("PROVIDER")
                        .requestMatchers("/providers/team-providers").hasRole("TEAM_LEADER")

                        // ── GROUPS (FULL GROUP MANAGEMENT) ──
                        // GroupController endpoints
                        .requestMatchers(HttpMethod.GET, "/groups/admin/all").hasAnyRole("ADMIN", "TEAM_LEADER")
                        .requestMatchers(HttpMethod.GET, "/groups/all").hasAnyRole("ADMIN", "TEAM_LEADER")
                        .requestMatchers(HttpMethod.GET, "/groups/team-leader/all").hasRole("TEAM_LEADER")
                        .requestMatchers(HttpMethod.POST, "/groups/team-leader/create").hasRole("TEAM_LEADER")
                        .requestMatchers(HttpMethod.POST, "/groups/create").hasAnyRole("ADMIN", "TEAM_LEADER")
                        .requestMatchers(HttpMethod.GET, "/groups/my-group").hasRole("GROUP_MGR")
                        .requestMatchers(HttpMethod.POST, "/groups/upload-file").hasRole("GROUP_MGR")
                        .requestMatchers(HttpMethod.GET, "/groups/{groupId}/providers").hasAnyRole("ADMIN", "TEAM_LEADER", "GROUP_MGR")
                        .requestMatchers(HttpMethod.GET, "/groups/{groupId}/managers").hasAnyRole("ADMIN", "TEAM_LEADER", "GROUP_MGR")
                        .requestMatchers(HttpMethod.GET, "/groups/{groupId}/available-managers").hasAnyRole("ADMIN", "TEAM_LEADER")
                        .requestMatchers(HttpMethod.POST, "/groups/{groupId}/assign-manager").hasAnyRole("ADMIN", "TEAM_LEADER")
                        .requestMatchers(HttpMethod.DELETE, "/groups/{groupId}/remove-manager/**").hasAnyRole("ADMIN", "TEAM_LEADER")
                        .requestMatchers(HttpMethod.POST, "/groups/{groupId}/add-provider").hasAnyRole("ADMIN", "TEAM_LEADER", "GROUP_MGR")
                        .requestMatchers(HttpMethod.POST, "/groups/{groupId}/remove-provider").hasAnyRole("ADMIN", "TEAM_LEADER", "GROUP_MGR")
                        .requestMatchers(HttpMethod.GET, "/groups/{groupId}").hasAnyRole("ADMIN", "TEAM_LEADER", "GROUP_MGR", "PROVIDER")

                        // GroupAssignmentController endpoints
                        .requestMatchers(HttpMethod.GET, "/groups/assignable-team-leaders").hasAnyRole("ADMIN", "TEAM_LEADER")
                        .requestMatchers(HttpMethod.GET, "/groups/assignable-team-members").hasAnyRole("ADMIN", "TEAM_LEADER")
                        .requestMatchers(HttpMethod.GET, "/groups/{groupId}/team-assignments").hasAnyRole("ADMIN", "TEAM_LEADER")
                        .requestMatchers(HttpMethod.POST, "/groups/{groupId}/assign-team-leader-to-group").hasAnyRole("ADMIN", "TEAM_LEADER")
                        .requestMatchers(HttpMethod.DELETE, "/groups/{groupId}/remove-team-leader-from-group/**").hasAnyRole("ADMIN", "TEAM_LEADER")
                        .requestMatchers(HttpMethod.POST, "/groups/{groupId}/assign-team-member-to-group").hasAnyRole("ADMIN", "TEAM_LEADER")
                        .requestMatchers(HttpMethod.DELETE, "/groups/{groupId}/remove-team-member-from-group/**").hasAnyRole("ADMIN", "TEAM_LEADER")
                        .requestMatchers(HttpMethod.POST, "/groups/{groupId}/link-provider").hasAnyRole("ADMIN", "TEAM_LEADER", "GROUP_MGR")
                        .requestMatchers(HttpMethod.DELETE, "/groups/{groupId}/unlink-provider/**").hasAnyRole("ADMIN", "TEAM_LEADER", "GROUP_MGR")
                        .requestMatchers(HttpMethod.GET, "/groups/provider/{providerId}/all").hasAnyRole("ADMIN", "TEAM_LEADER", "TEAM_MEMBER", "GROUP_MGR")

                        // ── CREDENTIALING ──
                        // View endpoints (GET) - accessible by ADMIN, TEAM_LEADER, GROUP_MGR
                        .requestMatchers(HttpMethod.GET, "/credentialing/**").hasAnyRole("ADMIN", "TEAM_LEADER", "GROUP_MGR")

                        // Write endpoints (POST, PUT, DELETE) - only ADMIN and TEAM_LEADER
                        .requestMatchers(HttpMethod.POST, "/credentialing/create").hasAnyRole("ADMIN", "TEAM_LEADER")
                        .requestMatchers(HttpMethod.PUT, "/credentialing/**").hasAnyRole("ADMIN", "TEAM_LEADER")
                        .requestMatchers(HttpMethod.DELETE, "/credentialing/**").hasAnyRole("ADMIN", "TEAM_LEADER")

                        // ── TASKS ──
                        .requestMatchers("/tasks/assign").hasAnyRole("ADMIN", "TEAM_LEADER")
                        .requestMatchers("/tasks/*/reassign").hasAnyRole("ADMIN", "TEAM_LEADER")
                        .requestMatchers("/tasks/team-tasks").hasRole("TEAM_LEADER")
                        .requestMatchers("/tasks/my-tasks").hasAnyRole("TEAM_MEMBER", "TEAM_LEADER")
                        .requestMatchers("/tasks/*/status").hasAnyRole("TEAM_MEMBER", "TEAM_LEADER")

                        // ── TEAM LEADER ──
                        .requestMatchers("/team-leader/**").hasRole("TEAM_LEADER")
                        .requestMatchers("/team/my-providers").hasAnyRole("TEAM_MEMBER", "TEAM_LEADER")

                        // ── USER / PROFILE ──
                        .requestMatchers("/users/my-profile").hasAnyRole("ADMIN", "TEAM_LEADER", "TEAM_MEMBER", "PROVIDER")
                        .requestMatchers("/users/my-team-members").hasRole("TEAM_LEADER")
                        .requestMatchers("/provider-profile/**").hasAnyRole("ADMIN", "TEAM_LEADER", "TEAM_MEMBER", "PROVIDER")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}