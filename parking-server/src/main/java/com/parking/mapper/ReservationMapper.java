package com.parking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.parking.entity.Reservation;
import com.parking.vo.ReservationVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ReservationMapper extends BaseMapper<Reservation> {

    @Select("SELECT * FROM reservation WHERE user_id = #{userId} AND deleted = 0 ORDER BY create_time DESC")
    List<Reservation> selectByUserId(@Param("userId") Long userId);

    @Select("SELECT * FROM reservation WHERE space_id = #{spaceId} AND status = 0 AND deleted = 0")
    List<Reservation> selectActiveBySpaceId(@Param("spaceId") Long spaceId);

    @Update("UPDATE reservation SET status = #{status} WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    @Update("UPDATE reservation SET status = #{status}, entry_time = #{entryTime} WHERE id = #{id}")
    int updateEntry(@Param("id") Long id, @Param("status") Integer status, @Param("entryTime") LocalDateTime entryTime);

    @Update("UPDATE reservation SET status = #{status}, cancel_time = #{cancelTime} WHERE id = #{id}")
    int updateCancel(@Param("id") Long id, @Param("status") Integer status, @Param("cancelTime") LocalDateTime cancelTime);

    @Select("SELECT * FROM reservation WHERE status = 0 AND end_time < #{now} AND deleted = 0")
    List<Reservation> selectExpired(@Param("now") LocalDateTime now);

    /**
     * 查询用户预约列表（包含关联的停车场和车位信息）
     */
    @Select("SELECT r.*, " +
            "pl.name AS parking_name, pl.address AS parking_address, pl.hourly_rate, " +
            "ps.space_no AS space_code, ps.floor " +
            "FROM reservation r " +
            "LEFT JOIN parking_lot pl ON r.lot_id = pl.id " +
            "LEFT JOIN parking_space ps ON r.space_id = ps.id " +
            "WHERE r.user_id = #{userId} AND r.deleted = 0 " +
            "ORDER BY r.create_time DESC")
    List<ReservationVO> selectVOByUserId(@Param("userId") Long userId);

    /**
     * 查询用户预约列表（按状态筛选，支持多状态）
     */
    @Select("<script>" +
            "SELECT r.*, " +
            "pl.name AS parking_name, pl.address AS parking_address, pl.hourly_rate, " +
            "ps.space_no AS space_code, ps.floor " +
            "FROM reservation r " +
            "LEFT JOIN parking_lot pl ON r.lot_id = pl.id " +
            "LEFT JOIN parking_space ps ON r.space_id = ps.id " +
            "WHERE r.user_id = #{userId} AND r.deleted = 0 " +
            "<if test='statusList != null and statusList.size() > 0'>" +
            "AND r.status IN " +
            "<foreach item='item' collection='statusList' open='(' separator=',' close=')'>" +
            "#{item}" +
            "</foreach>" +
            "</if>" +
            "ORDER BY r.create_time DESC" +
            "</script>")
    List<ReservationVO> selectVOByUserIdAndStatus(@Param("userId") Long userId, @Param("statusList") List<Integer> statusList);

    /**
     * 查询预约详情（包含关联的停车场和车位信息）
     */
    @Select("SELECT r.*, " +
            "pl.name AS parking_name, pl.address AS parking_address, pl.hourly_rate, " +
            "ps.space_no AS space_code, ps.floor " +
            "FROM reservation r " +
            "LEFT JOIN parking_lot pl ON r.lot_id = pl.id " +
            "LEFT JOIN parking_space ps ON r.space_id = ps.id " +
            "WHERE r.id = #{id} AND r.deleted = 0")
    ReservationVO selectVOById(@Param("id") Long id);

    /**
     * 查询未支付超时的预约
     */
    @Select("SELECT * FROM reservation WHERE status = 4 AND create_time < #{expireTime} AND deleted = 0")
    List<Reservation> selectUnpaidExpired(@Param("expireTime") LocalDateTime expireTime);

    /**
     * 查询预约开始时间已过但未入场的预约（占位不进场漏洞修复）
     * 条件：status=0（待使用） + start_time已过指定分钟数 + 未入场
     */
    @Select("SELECT * FROM reservation WHERE status = 0 AND start_time < #{expireTime} AND entry_time IS NULL AND deleted = 0")
    List<Reservation> selectStartExpired(@Param("expireTime") LocalDateTime expireTime);

    /**
     * 查询用户的待支付预约（防止重复创建订单）
     */
    @Select("SELECT * FROM reservation WHERE user_id = #{userId} AND status = 4 AND deleted = 0 ORDER BY create_time DESC LIMIT 1")
    Reservation selectUnpaidByUserId(@Param("userId") Long userId);

    /**
     * 查询车位是否有进行中的预约（待使用、使用中、待支付）
     */
    @Select("SELECT COUNT(*) FROM reservation WHERE space_id = #{spaceId} AND status IN (0, 1, 4, 6) AND deleted = 0")
    int countActiveReservationBySpaceId(@Param("spaceId") Long spaceId);

    /**
     * 查询车位是否有阻塞停止/暂停的预约（待使用、使用中、待支付预约费），不含待支付停车费
     */
    @Select("SELECT COUNT(*) FROM reservation WHERE space_id = #{spaceId} AND status IN (0, 1, 4) AND deleted = 0")
    int countBlockingReservationBySpaceId(@Param("spaceId") Long spaceId);
}
