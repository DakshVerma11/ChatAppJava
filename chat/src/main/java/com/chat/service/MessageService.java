package com.chat.service;

import com.chat.entity.Message;
import com.chat.repository.MessageRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {
    private final MessageRepository msgRepo;
    public MessageService(MessageRepository msgRepo) { this.msgRepo = msgRepo; }
    public Message send(Message m) {
        m.setSentAt(LocalDateTime.now());
        m.setDelivered(true);
        return msgRepo.save(m);
    }
    public List<Message> history(Long s, Long r) {
        return msgRepo.findBySenderIdAndReceiverId(s, r);
    }
    @Scheduled(cron = "0 0 0 * * ?")
    public void purgeOld() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        msgRepo.findAll().stream()
            .filter(m -> m.getSentAt().isBefore(cutoff))
            .forEach(m -> msgRepo.deleteById(m.getMessageId()));
    }
}