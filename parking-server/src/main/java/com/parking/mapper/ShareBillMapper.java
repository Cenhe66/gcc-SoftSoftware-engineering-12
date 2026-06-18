package com.parking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.parking.entity.ShareBill;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ShareBillMapper extends BaseMapper<ShareBill> {

    @Select("SELECT * FROM share_bill WHERE owner_id = #{ownerId} AND deleted = 0 ORDER BY create_time DESC")
    List<ShareBill> selectByOwnerId(@Param("ownerId") Long ownerId);

    @Select("SELECT * FROM share_bill WHERE renter_id = #{renterId} AND deleted = 0 ORDER BY create_time DESC")
    List<ShareBill> selectByRenterId(@Param("renterId") Long renterId);

    @Select("SELECT * FROM share_bill WHERE share_record_id = #{shareRecordId} AND deleted = 0 ORDER BY create_time DESC")
    List<ShareBill> selectByShareRecordId(@Param("shareRecordId") Long shareRecordId);
}
